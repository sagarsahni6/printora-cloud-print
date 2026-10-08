using WifiPrintServer.Models;

namespace WifiPrintServer.Services;

/// <summary>
/// Validates uploaded files and converts unsupported formats to PDF.
/// </summary>
public class FileProcessingService
{
    private readonly ILogger<FileProcessingService> _logger;
    private readonly AppSettings _settings;

    private static readonly HashSet<string> SupportedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".jpg", ".jpeg", ".png", ".bmp", ".gif",
        ".txt", ".text", ".docx", ".doc"
    };

    private static readonly HashSet<string> ImageExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".bmp", ".gif"
    };

    public FileProcessingService(ILogger<FileProcessingService> logger, AppSettings settings)
    {
        _logger = logger;
        _settings = settings;
    }

    public async Task<(string? FilePath, string? Error)> SaveAndValidateFileAsync(
        Stream fileStream, string fileName, long fileSize)
    {
        fileName = SanitizeFileName(fileName);
        var ext = Path.GetExtension(fileName);
        if (!SupportedExtensions.Contains(ext))
            return (null, $"Unsupported file type: {ext}");

        long maxBytes = _settings.MaxFileSizeMB * 1024L * 1024L;
        if (fileSize > maxBytes)
            return (null, $"File too large. Max: {_settings.MaxFileSizeMB}MB");

        Directory.CreateDirectory(_settings.UploadDirectory);
        string uniqueName = $"{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid().ToString("N")[..6]}_{fileName}";
        string filePath = Path.Combine(_settings.UploadDirectory, uniqueName);

        try
        {
            using (var fs = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(fs);
            }

            if (!ValidateFileContent(filePath, ext))
            {
                try { File.Delete(filePath); } catch { }
                _logger.LogWarning("File content validation failed for {FileName} (type {Ext})", fileName, ext);
                return (null, $"File content does not match the expected format for '{ext}'");
            }

            _logger.LogInformation("File saved and verified: {Path} ({Size} bytes)", filePath, fileSize);
            return (filePath, null);
        }
        catch (Exception ex)
        {
            try { if (File.Exists(filePath)) File.Delete(filePath); } catch { }
            return (null, $"Failed to save file: {ex.Message}");
        }
    }

    /// <summary>
    /// Inspects file header magic bytes to prevent file extension spoofing and disguised executables.
    /// </summary>
    public static bool ValidateFileContent(string filePath, string ext)
    {
        try
        {
            var header = new byte[8];
            using (var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                int bytesRead = fs.Read(header, 0, header.Length);
                if (bytesRead < 2) return false;
            }

            ext = ext.ToLowerInvariant();
            return ext switch
            {
                ".pdf" => header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46, // %PDF
                ".jpg" or ".jpeg" => header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF,
                ".png" => header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47, // .PNG
                ".bmp" => header[0] == 0x42 && header[1] == 0x4D, // BM
                ".gif" => header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46, // GIF
                ".docx" => header[0] == 0x50 && header[1] == 0x4B && header[2] == 0x03 && header[3] == 0x04, // PK..
                ".doc" => (header[0] == 0xD0 && header[1] == 0xCF && header[2] == 0x11 && header[3] == 0xE0) ||
                          (header[0] == 0x50 && header[1] == 0x4B && header[2] == 0x03 && header[3] == 0x04),
                ".txt" or ".text" => !(header[0] == 0x4D && header[1] == 0x5A) && // Not Windows PE (MZ)
                                     !(header[0] == 0x7F && header[1] == 0x45 && header[2] == 0x4C && header[3] == 0x46), // Not Linux ELF
                _ => false
            };
        }
        catch
        {
            return false;
        }
    }

    public async Task<(string? ConvertedPath, string? Error)> ConvertIfNeededAsync(string filePath)
    {
        var ext = Path.GetExtension(filePath).ToLowerInvariant();
        if (ext == ".pdf" || ImageExtensions.Contains(ext) || ext is ".txt" or ".text")
            return (filePath, null);

        if (ext == ".docx" || ext == ".doc")
            return await ConvertDocxToPdfAsync(filePath);


        return (null, $"No converter for {ext}");
    }

    private async Task<(string?, string?)> ConvertDocxToPdfAsync(string filePath)
    {
        try
        {
            string outputDir = Path.GetDirectoryName(filePath) ?? _settings.UploadDirectory;
            string[] paths = {
                @"C:\Program Files\LibreOffice\program\soffice.exe",
                @"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
                "soffice"
            };
            string? soffice = paths.FirstOrDefault(p => p == "soffice" || File.Exists(p));
            if (soffice == null)
                return (null, "LibreOffice required for DOCX conversion but not found.");

            var psi = new System.Diagnostics.ProcessStartInfo
            {
                FileName = soffice,
                Arguments = $"--headless --convert-to pdf --outdir \"{outputDir}\" \"{filePath}\"",
                CreateNoWindow = true, UseShellExecute = false,
                RedirectStandardError = true
            };
            using var proc = System.Diagnostics.Process.Start(psi);
            if (proc == null) return (null, "Failed to start LibreOffice");
            await proc.WaitForExitAsync();

            string pdfPath = Path.ChangeExtension(filePath, ".pdf");
            return File.Exists(pdfPath) ? (pdfPath, null) : (null, "Conversion produced no output");
        }
        catch (Exception ex) { return (null, ex.Message); }
    }

    public static string GetFileType(string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        if (ext == ".pdf") return "PDF";
        if (ImageExtensions.Contains(ext)) return "Image";
        if (ext is ".docx" or ".doc") return "Document";
        if (ext is ".txt" or ".text") return "Text";
        return "Unknown";
    }

    public static string SanitizeFileName(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            return "document";

        fileName = Path.GetFileName(fileName).Trim();
        foreach (char c in Path.GetInvalidFileNameChars())
        {
            fileName = fileName.Replace(c, '_');
        }
        fileName = fileName.Replace("\0", string.Empty);
        return string.IsNullOrWhiteSpace(fileName) ? "document" : fileName;
    }

    public void CleanupOldFiles()
    {
        try
        {
            if (!Directory.Exists(_settings.UploadDirectory)) return;
            var cutoff = DateTime.UtcNow.AddHours(-24);
            foreach (var file in Directory.GetFiles(_settings.UploadDirectory))
                if (File.GetCreationTimeUtc(file) < cutoff) File.Delete(file);
        }
        catch (Exception ex) { _logger.LogWarning(ex, "Cleanup error"); }
    }
}
