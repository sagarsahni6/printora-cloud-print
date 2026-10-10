using System.Collections.Concurrent;

namespace WifiPrintServer.Services;

/// <summary>
/// Sliding-window rate limiter with per-key and global caps.
/// Thread-safe. Reusable across auth endpoints and web print PIN verification.
/// </summary>
public class AttemptLimiter
{
    private readonly ConcurrentDictionary<string, List<DateTime>> _attempts = new();
    private readonly int _maxPerKey;
    private readonly TimeSpan _window;
    private readonly int _globalMax;
    private int _globalCount;
    private DateTime _globalWindowStart = DateTime.UtcNow;
    private readonly object _lock = new();

    /// <param name="maxPerKey">Max failures per key (e.g. IP) within the window.</param>
    /// <param name="window">Sliding window duration.</param>
    /// <param name="globalMax">Global cap across all keys within the window (defeats IP rotation).</param>
    public AttemptLimiter(int maxPerKey, TimeSpan window, int globalMax = 50)
    {
        _maxPerKey = maxPerKey;
        _window = window;
        _globalMax = globalMax;
    }

    /// <summary>
    /// Returns true if the key is currently locked out. Sets retryAfter to the remaining lockout time.
    /// </summary>
    public bool IsLocked(string key, out TimeSpan retryAfter)
    {
        var now = DateTime.UtcNow;
        lock (_lock)
        {
            // Global cap check
            if ((now - _globalWindowStart) > _window)
            {
                _globalCount = 0;
                _globalWindowStart = now;
            }
            if (_globalCount >= _globalMax)
            {
                retryAfter = _window - (now - _globalWindowStart);
                if (retryAfter < TimeSpan.Zero) retryAfter = TimeSpan.Zero;
                return true;
            }

            // Per-key check
            if (_attempts.TryGetValue(key, out var attempts))
            {
                attempts.RemoveAll(t => (now - t) > _window);
                if (attempts.Count >= _maxPerKey)
                {
                    var oldest = attempts[0];
                    retryAfter = _window - (now - oldest);
                    if (retryAfter < TimeSpan.Zero) retryAfter = TimeSpan.Zero;
                    return true;
                }
            }
        }

        retryAfter = TimeSpan.Zero;
        return false;
    }

    /// <summary>
    /// Records a failed attempt for the given key.
    /// </summary>
    public void RecordFailure(string key)
    {
        var now = DateTime.UtcNow;
        lock (_lock)
        {
            var list = _attempts.GetOrAdd(key, _ => new List<DateTime>());
            list.Add(now);
            _globalCount++;
        }
    }

    /// <summary>
    /// Clears failed attempts for the given key (call on success).
    /// </summary>
    public void Reset(string key)
    {
        _attempts.TryRemove(key, out _);
    }
}
