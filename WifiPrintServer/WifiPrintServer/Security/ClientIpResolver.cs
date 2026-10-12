using System.Net;

namespace WifiPrintServer.Security;

/// <summary>
/// Single source of truth for extracting the real client IP.
/// Only honors CF-Connecting-IP / X-Forwarded-For when the TCP peer is loopback
/// (i.e. the local cloudflared process). Otherwise uses RemoteIpAddress.
/// Prevents header-spoofing from direct connections.
/// </summary>
public static class ClientIpResolver
{
    public static string GetClientIp(HttpContext context)
    {
        var remote = context.Connection.RemoteIpAddress;
        bool peerIsLoopback = remote != null && IPAddress.IsLoopback(remote);

        if (peerIsLoopback)
        {
            if (context.Request.Headers.TryGetValue("X-Forwarded-For", out var xff) &&
                !string.IsNullOrWhiteSpace(xff))
            {
                var first = xff.ToString().Split(',')[0].Trim();
                if (first.Contains(':') && !first.Contains('[') && first.IndexOf(':') == first.LastIndexOf(':'))
                {
                    first = first.Split(':')[0];
                }
                if (!string.IsNullOrEmpty(first)) return first;
            }

            if (context.Request.Headers.TryGetValue("CF-Connecting-IP", out var cf) &&
                !string.IsNullOrWhiteSpace(cf))
                return cf.ToString().Trim();
        }

        var ip = remote?.ToString() ?? "127.0.0.1";
        return ip.StartsWith("::ffff:") ? ip[7..] : ip;
    }

    /// <summary>
    /// Returns true if the request appears to come through a Cloudflare tunnel
    /// (TCP peer is loopback AND CF headers are present).
    /// </summary>
    public static bool IsViaTunnel(HttpContext context)
    {
        var remote = context.Connection.RemoteIpAddress;
        if (remote == null || !IPAddress.IsLoopback(remote))
            return false;

        return context.Request.Headers.ContainsKey("CF-Connecting-IP") ||
               context.Request.Headers.ContainsKey("CF-Ray");
    }
}
