using System.Collections.Concurrent;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using WifiPrintServer.Models;
using WifiPrintServer.Security;

namespace WifiPrintServer.Services;

/// <summary>
/// Service providing multi-layer defense against spam printing, unauthorized internet access,
/// rate abuse, paper/toner exhaustion, and bot attacks on the Web Print Studio.
/// </summary>
public class WebPrintProtectionService
{
    private readonly AppSettings _settings;
    private readonly TunnelService _tunnelService;
    private readonly ILogger<WebPrintProtectionService> _logger;

    // IP-based sliding window rate limiting
    private readonly ConcurrentDictionary<string, List<DateTime>> _submissionHistory = new();
    private readonly AttemptLimiter _pinLimiter = new(5, TimeSpan.FromMinutes(5), 50);
    private readonly object _lock = new();

    public WebPrintProtectionService(
        AppSettings settings,
        TunnelService tunnelService,
        ILogger<WebPrintProtectionService> logger)
    {
        _settings = settings;
        _tunnelService = tunnelService;
        _logger = logger;
    }

    /// <summary>
    /// Checks whether an IP address belongs to a local private network or loopback.
    /// </summary>
    public static bool IsLocalOrPrivateIp(string? ipStr)
    {
        if (string.IsNullOrWhiteSpace(ipStr)) return false;
        ipStr = ipStr.Trim();

        if (ipStr.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
            ipStr == "127.0.0.1" || ipStr == "::1" || ipStr == "Web")
            return true;

        if (ipStr.StartsWith("::ffff:"))
            ipStr = ipStr.Substring(7);

        if (IPAddress.TryParse(ipStr, out var ip))
        {
            if (IPAddress.IsLoopback(ip)) return true;
            if (ip.IsIPv6LinkLocal || ip.IsIPv6SiteLocal) return true;

            var bytes = ip.GetAddressBytes();
            if (bytes.Length == 4)
            {
                // 10.0.0.0 - 10.255.255.255
                if (bytes[0] == 10) return true;
                // 172.16.0.0 - 172.31.255.255
                if (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) return true;
                // 192.168.0.0 - 192.168.255.255
                if (bytes[0] == 192 && bytes[1] == 168) return true;
                // 169.254.0.0 - 169.254.255.255 (APIPA)
                if (bytes[0] == 169 && bytes[1] == 254) return true;
            }
        }

        return false;
    }

    /// <summary>
    /// Extracts the real client IP using centralized ClientIpResolver.
    /// </summary>
    public string GetEffectiveClientIp(HttpContext? context)
    {
        if (context == null) return "127.0.0.1";
        return ClientIpResolver.GetClientIp(context);
    }

    /// <summary>
    /// Detects whether the request originates from a Cloudflare Tunnel or external public internet.
    /// </summary>
    public bool IsRequestFromTunnel(HttpContext context)
    {
        // 1. Cloudflare ingress headers
        if (context.Request.Headers.ContainsKey("CF-Connecting-IP") ||
            context.Request.Headers.ContainsKey("CF-Ray") ||
            context.Request.Headers.ContainsKey("CF-Visitor"))
        {
            return true;
        }

        // 2. Host header contains trycloudflare.com or calclabz.com
        var host = context.Request.Host.Host;
        if (host.EndsWith("trycloudflare.com", StringComparison.OrdinalIgnoreCase) ||
            host.EndsWith("calclabz.com", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        // 3. Match against currently active Tunnel public URL
        var tunnelUrl = _tunnelService.PublicUrl ?? Program.TunnelServiceInstance?.PublicUrl;
        if (!string.IsNullOrWhiteSpace(tunnelUrl))
        {
            try
            {
                var uri = new Uri(tunnelUrl);
                if (string.Equals(uri.Host, host, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            catch { }
        }

        // 4. Match against configured CustomPublicUrl (e.g., https://printora.calclabz.com)
        if (!string.IsNullOrWhiteSpace(_settings.CustomPublicUrl))
        {
            try
            {
                var customUri = new Uri(_settings.CustomPublicUrl);
                if (string.Equals(customUri.Host, host, StringComparison.OrdinalIgnoreCase))
                    return true;
            }
            catch { }
        }

        // 5. Host is a public domain (contains dots, not localhost, and not numeric private IP)
        if (host.Contains('.') && !IsLocalOrPrivateIp(host) && !host.Equals("localhost", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        // 6. Check common reverse-proxy headers (Cloudflare, Nginx, caddy, tunnel)
        if (context.Request.Headers.TryGetValue("X-Forwarded-Host", out var forwardedHost))
        {
            var fHost = forwardedHost.ToString().Trim();
            if (!string.IsNullOrWhiteSpace(fHost) &&
                !fHost.StartsWith("localhost", StringComparison.OrdinalIgnoreCase) &&
                !fHost.StartsWith("127.0.0.1") &&
                !IsLocalOrPrivateIp(fHost))
            {
                return true;
            }
        }

        // 7. Remote IP is not private LAN
        var clientIp = GetEffectiveClientIp(context);
        if (!IsLocalOrPrivateIp(clientIp))
        {
            return true;
        }

        return false;
    }

    /// <summary>
    /// Validates a submitted 6-digit PIN or QR pairing token and issues a 2-hour signed session token.
    /// Enforces anti-brute-force lockout (max 5 failed attempts per 5 minutes per IP).
    /// </summary>
    public (bool Success, string? Token, DateTime? ExpiresAt, string? ErrorMessage) VerifyPin(string pin, string clientIp)
    {
        var now = DateTime.UtcNow;

        if (_pinLimiter.IsLocked(clientIp, out var retryAfter))
        {
            _logger.LogWarning("IP {Ip} is temporarily locked out from PIN verification due to repeated failures", clientIp);
            return (false, null, null, "Too many incorrect PIN attempts. Please wait 5 minutes before trying again.");
        }

        var cleanPin = pin?.Trim() ?? "";
        bool isValid = false;

        // Compare against rotating Connection PIN
        if (!string.IsNullOrEmpty(_settings.CurrentConnectionPin) &&
            ConstantTimeEquals(_settings.CurrentConnectionPin, cleanPin))
        {
            isValid = true;
        }
        // Also allow the permanent QR pairing token
        else if (!string.IsNullOrEmpty(_settings.CurrentQrPairingToken) &&
                 ConstantTimeEquals(_settings.CurrentQrPairingToken, cleanPin))
        {
            isValid = true;
        }

        if (!isValid)
        {
            _pinLimiter.RecordFailure(clientIp);
            _logger.LogWarning("Failed PIN attempt from IP {Ip}: '{Pin}'", clientIp, cleanPin);
            return (false, null, null, "Invalid PIN. Please enter the 6-digit PIN displayed on the host PC screen.");
        }

        // Clear failed attempts on success
        _pinLimiter.Reset(clientIp);

        var token = CreateSessionToken(clientIp, 2);
        var expiresAt = now.AddHours(2);
        _logger.LogInformation("PIN successfully verified for IP {Ip}. Session issued until {Exp}", clientIp, expiresAt);

        return (true, token, expiresAt, null);
    }

    private static bool ConstantTimeEquals(string? a, string? b)
    {
        if (a == null || b == null) return a == b;
        var aBytes = Encoding.UTF8.GetBytes(a);
        var bBytes = Encoding.UTF8.GetBytes(b);
        if (aBytes.Length != bBytes.Length) return false;
        return CryptographicOperations.FixedTimeEquals(aBytes, bBytes);
    }

    /// <summary>
    /// Creates an HMAC signed session token for an approved web client, valid for the specified hours.
    /// </summary>
    public string CreateSessionToken(string clientIp, int durationHours = 2)
    {
        var expiresAt = DateTime.UtcNow.AddHours(durationHours);
        var expSeconds = new DateTimeOffset(expiresAt).ToUnixTimeSeconds();
        var nonce = Guid.NewGuid().ToString("N");
        var payload = $"{clientIp}|{expSeconds}|{nonce}";

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_settings.JwtSecret));
        var signature = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));

        return $"{Convert.ToBase64String(Encoding.UTF8.GetBytes(payload))}.{Convert.ToBase64String(signature)}";
    }

    /// <summary>
    /// Validates an HMAC session token for Cloudflare tunnel clients.
    /// On direct LAN connections, client IP binding is strictly enforced.
    /// On tunnel/proxy connections, edge node IP rotation (Vercel, Cloudflare, mobile CGNAT) is tolerated.
    /// </summary>
    public bool ValidateSession(string? token, string clientIp, bool isTunnel = false)
    {
        if (string.IsNullOrWhiteSpace(token)) return false;

        try
        {
            var parts = token.Split('.');
            if (parts.Length != 2) return false;

            var payloadBytes = Convert.FromBase64String(parts[0]);
            var signatureBytes = Convert.FromBase64String(parts[1]);
            var payload = Encoding.UTF8.GetString(payloadBytes);

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_settings.JwtSecret));
            var expectedSignature = hmac.ComputeHash(payloadBytes);

            if (!CryptographicOperations.FixedTimeEquals(signatureBytes, expectedSignature))
                return false;

            var payloadParts = payload.Split('|');
            if (payloadParts.Length < 2) return false;

            // Check expiry first
            if (!long.TryParse(payloadParts[1], out var expSeconds)) return false;
            var currentSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            if (currentSeconds > expSeconds) return false;

            // Check client IP binding on direct non-tunnel connections
            // Tunnel/proxy traffic routes through rotating edge nodes (Vercel, Cloudflare, cellular CGNAT)
            if (!isTunnel && !string.Equals(payloadParts[0], clientIp, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Session token IP mismatch: token issued for {TokenIp}, presented by {ClientIp}",
                    payloadParts[0], clientIp);
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Session token validation error for IP {Ip}", clientIp);
            return false;
        }
    }

    /// <summary>
    /// Checks sliding window rate limit (max 2 per minute, max 15 per hour per IP).
    /// </summary>
    public (bool Allowed, string? ErrorMessage) CheckRateLimit(string clientIp)
    {
        var now = DateTime.UtcNow;

        lock (_lock)
        {
            if (_submissionHistory.TryGetValue(clientIp, out var history))
            {
                // Prune records older than 1 hour
                history.RemoveAll(t => (now - t).TotalMinutes > 60);

                var countLastMinute = history.Count(t => (now - t).TotalSeconds <= 60);
                if (countLastMinute >= _settings.WebPrintRateLimitPerMinute)
                {
                    return (false, $"Rate limit exceeded. Maximum {_settings.WebPrintRateLimitPerMinute} print jobs per minute allowed. Please wait a moment.");
                }

                if (history.Count >= _settings.WebPrintRateLimitPerHour)
                {
                    return (false, $"Hourly rate limit reached (max {_settings.WebPrintRateLimitPerHour} jobs/hour). Please contact the printer operator.");
                }
            }
        }

        return (true, null);
    }

    /// <summary>
    /// Records a successful print submission for rate limit tracking.
    /// </summary>
    public void RecordSubmission(string clientIp)
    {
        lock (_lock)
        {
            var list = _submissionHistory.GetOrAdd(clientIp, _ => new List<DateTime>());
            list.Add(DateTime.UtcNow);
        }
    }

    /// <summary>
    /// Checks if the client already has an active, unprocessed job in the queue to prevent concurrency spam.
    /// </summary>
    public bool HasActiveJob(string clientIp, PrintQueueManager queueManager)
    {
        var targetDevice = $"web-{clientIp}";
        var activeStates = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Queued", "Processing", "Printing", "Rendering"
        };

        var allJobs = queueManager.GetAllJobs();
        return allJobs.Any(j => j.DeviceId == targetDevice && activeStates.Contains(j.QueueState));
    }
}
