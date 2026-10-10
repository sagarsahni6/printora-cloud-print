using System.Security.Cryptography;
using System.Text;

namespace WifiPrintServer.Security;

/// <summary>
/// Protects secrets at rest using Windows DPAPI (CurrentUser scope).
/// Protected values are stored as "dpapi:&lt;base64&gt;". Plaintext values
/// pass through transparently, enabling automatic migration from unprotected settings.
/// </summary>
public static class DpapiProtector
{
    private const string Prefix = "dpapi:";

    /// <summary>
    /// Encrypts a plaintext string with DPAPI. Returns "dpapi:&lt;base64&gt;".
    /// </summary>
    public static string Protect(string plaintext)
    {
        if (string.IsNullOrEmpty(plaintext)) return plaintext;
        var bytes = Encoding.UTF8.GetBytes(plaintext);
        var encrypted = ProtectedData.Protect(bytes, null, DataProtectionScope.CurrentUser);
        return Prefix + Convert.ToBase64String(encrypted);
    }

    /// <summary>
    /// Decrypts a DPAPI-protected string. If the value is not prefixed with "dpapi:",
    /// it is returned as-is (plaintext migration path).
    /// </summary>
    public static string Unprotect(string protectedValue)
    {
        if (string.IsNullOrEmpty(protectedValue)) return protectedValue;
        if (!protectedValue.StartsWith(Prefix, StringComparison.Ordinal))
            return protectedValue; // plaintext — not yet migrated
        try
        {
            var encrypted = Convert.FromBase64String(protectedValue[Prefix.Length..]);
            var bytes = ProtectedData.Unprotect(encrypted, null, DataProtectionScope.CurrentUser);
            return Encoding.UTF8.GetString(bytes);
        }
        catch (CryptographicException)
        {
            // DPAPI key rotated or user profile changed — can't decrypt
            return string.Empty;
        }
    }

    /// <summary>
    /// Returns true if the value is DPAPI-protected.
    /// </summary>
    public static bool IsProtected(string? value) =>
        value != null && value.StartsWith(Prefix, StringComparison.Ordinal);
}
