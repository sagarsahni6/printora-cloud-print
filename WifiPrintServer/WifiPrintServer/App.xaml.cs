using System.Diagnostics;
using System.Windows;

namespace WifiPrintServer;

public partial class App : Application
{
    private static readonly string InstallDir = Directory.Exists(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "Printora Server"))
        ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "Printora Server")
        : Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "PrintoraServer");

    private static readonly string InstalledExePath = Path.Combine(InstallDir, "PrintoraServer.exe");

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        AppDomain.CurrentDomain.UnhandledException += (s, args) =>
        {
            try
            {
                var dir = AppSettings.AppDataDir;
                Directory.CreateDirectory(dir);
                File.WriteAllText(Path.Combine(dir, "crash_domain.log"), args.ExceptionObject?.ToString() ?? "Unknown domain error");
            }
            catch { }
        };

        DispatcherUnhandledException += (s, args) =>
        {
            try
            {
                var dir = AppSettings.AppDataDir;
                Directory.CreateDirectory(dir);
                File.WriteAllText(Path.Combine(dir, "crash_dispatcher.log"), args.Exception?.ToString() ?? "Unknown dispatcher error");
            }
            catch { }
        };

        // ── Self-install check ──────────────────────────────────────
        // If the executable is named Setup/Installer, or has --install argument,
        // or is NOT running from the installed location (and no --skip-install),
        // show the setup installer wizard.
        var currentExe = Environment.ProcessPath ?? Process.GetCurrentProcess().MainModule?.FileName ?? "";
        var currentDir = AppContext.BaseDirectory;
        var exeName = Path.GetFileName(currentExe);
        bool hasInnoUninstaller = File.Exists(Path.Combine(currentDir, "unins000.exe"));
        bool isInstallerNamed = exeName.Contains("setup", StringComparison.OrdinalIgnoreCase)
                             || exeName.Contains("installer", StringComparison.OrdinalIgnoreCase);
        bool isDebugOrDev = Debugger.IsAttached
            || currentDir.Contains("bin\\Debug", StringComparison.OrdinalIgnoreCase)
            || currentDir.Contains("bin\\Release", StringComparison.OrdinalIgnoreCase);

        bool isInstalled = isDebugOrDev || hasInnoUninstaller || (!isInstallerNamed && !string.IsNullOrEmpty(currentExe)
            && (Path.GetFullPath(currentExe).StartsWith(Path.GetFullPath(InstallDir), StringComparison.OrdinalIgnoreCase)
             || Path.GetFullPath(currentExe).Contains("Program Files", StringComparison.OrdinalIgnoreCase)
             || Path.GetFullPath(currentExe).Contains("Programs", StringComparison.OrdinalIgnoreCase)));
        bool skipInstall = e.Args.Any(a => a.Equals("--skip-install", StringComparison.OrdinalIgnoreCase) || a.Equals("--no-install", StringComparison.OrdinalIgnoreCase));
        bool forceInstall = !hasInnoUninstaller && (isInstallerNamed || e.Args.Any(a => a.Equals("--install", StringComparison.OrdinalIgnoreCase)));

        if ((!isInstalled || forceInstall) && !skipInstall)
        {
            // Run the self-installer UI modally
            ShutdownMode = ShutdownMode.OnExplicitShutdown;
            RunSelfInstaller(currentExe);
            return; // Installer terminates the app after launch
        }

        // ── Normal server startup ───────────────────────────────────
        ShutdownMode = ShutdownMode.OnExplicitShutdown;

        try
        {
            // Initialize settings
            Program.Initialize();

            // Ensure upload/log directories exist
            Directory.CreateDirectory(Program.Settings.UploadDirectory);
            Directory.CreateDirectory(Program.Settings.LogDirectory);

            // Initialize and show main window manually since StartupUri was removed
            var mainWindow = new MainWindow();
            mainWindow.Show();

            // Start the web server on a background thread
            _ = Task.Run(async () =>
            {
                try
                {
                    await Program.StartWebServerAsync();
                }
                catch (Exception ex)
                {
                    try
                    {
                        var logFile = Path.Combine(AppSettings.AppDataDir, "server_startup_error.log");
                        File.WriteAllText(logFile, ex.ToString());
                    }
                    catch { }

                    Dispatcher.Invoke(() =>
                    {
                        MessageBox.Show($"Failed to start server:\n{ex.Message}",
                            "Printora Server", MessageBoxButton.OK, MessageBoxImage.Error);
                    });
                }
            });

            // Setup system tray icon
            SetupTrayIcon();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"FATAL: {ex}");
            MessageBox.Show($"Startup failed:\n{ex}", "Printora Server — Fatal Error",
                MessageBoxButton.OK, MessageBoxImage.Error);
            Shutdown(1);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // Self-Installer (runs when EXE is NOT in the installed location)
    // ═══════════════════════════════════════════════════════════════

    private void RunSelfInstaller(string sourceExe)
    {
        var form = new System.Windows.Forms.Form
        {
            Text = "Printora Server — Setup",
            Width = 560,
            Height = 480,
            FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog,
            MaximizeBox = false,
            StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen,
            BackColor = System.Drawing.Color.FromArgb(248, 249, 252),
            Font = new System.Drawing.Font("Segoe UI", 9F)
        };

        // Header
        var header = new System.Windows.Forms.Panel
        {
            Dock = System.Windows.Forms.DockStyle.Top,
            Height = 85,
            BackColor = System.Drawing.Color.FromArgb(26, 35, 60)
        };
        header.Controls.Add(new System.Windows.Forms.Label
        {
            Text = "Printora Server Setup",
            ForeColor = System.Drawing.Color.White,
            Font = new System.Drawing.Font("Segoe UI", 14F, System.Drawing.FontStyle.Bold),
            Location = new System.Drawing.Point(24, 16),
            AutoSize = true
        });
        header.Controls.Add(new System.Windows.Forms.Label
        {
            Text = "Install desktop server to print from Android or Web over Cloud & Wi-Fi",
            ForeColor = System.Drawing.Color.FromArgb(170, 195, 240),
            Font = new System.Drawing.Font("Segoe UI", 9F),
            Location = new System.Drawing.Point(25, 48),
            AutoSize = true
        });
        form.Controls.Add(header);

        // Destination path
        form.Controls.Add(new System.Windows.Forms.Label
        {
            Text = "Destination Folder:",
            Location = new System.Drawing.Point(25, 105),
            AutoSize = true,
            Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold)
        });

        var txtPath = new System.Windows.Forms.TextBox
        {
            Text = InstallDir,
            Location = new System.Drawing.Point(28, 130),
            Width = 380,
            Font = new System.Drawing.Font("Segoe UI", 9F)
        };
        form.Controls.Add(txtPath);

        var btnBrowse = new System.Windows.Forms.Button
        {
            Text = "Browse...",
            Location = new System.Drawing.Point(418, 128),
            Width = 95,
            Height = 27,
            BackColor = System.Drawing.Color.White,
            FlatStyle = System.Windows.Forms.FlatStyle.System
        };
        btnBrowse.Click += (s, ev) =>
        {
            using var dlg = new System.Windows.Forms.FolderBrowserDialog { SelectedPath = txtPath.Text };
            if (dlg.ShowDialog(form) == System.Windows.Forms.DialogResult.OK)
                txtPath.Text = dlg.SelectedPath;
        };
        form.Controls.Add(btnBrowse);

        // Options
        var grp = new System.Windows.Forms.GroupBox
        {
            Text = "Installation Options",
            Location = new System.Drawing.Point(28, 175),
            Width = 485,
            Height = 145
        };
        var chkDesktop = new System.Windows.Forms.CheckBox { Text = "Create Desktop Shortcut", Checked = true, Location = new System.Drawing.Point(16, 25), AutoSize = true };
        var chkStartMenu = new System.Windows.Forms.CheckBox { Text = "Create Start Menu Shortcut", Checked = true, Location = new System.Drawing.Point(16, 52), AutoSize = true };
        var chkFirewall = new System.Windows.Forms.CheckBox { Text = "Allow port 5000 in Windows Firewall (Recommended)", Checked = true, Location = new System.Drawing.Point(16, 79), AutoSize = true };
        var chkLaunch = new System.Windows.Forms.CheckBox { Text = "Launch Printora Server after installation", Checked = true, Location = new System.Drawing.Point(16, 106), AutoSize = true };
        grp.Controls.AddRange(new System.Windows.Forms.Control[] { chkDesktop, chkStartMenu, chkFirewall, chkLaunch });
        form.Controls.Add(grp);

        // Progress
        var progress = new System.Windows.Forms.ProgressBar
        {
            Location = new System.Drawing.Point(28, 335),
            Width = 485,
            Height = 18,
            Style = System.Windows.Forms.ProgressBarStyle.Continuous,
            Visible = false
        };
        form.Controls.Add(progress);

        var lblStatus = new System.Windows.Forms.Label
        {
            Text = "Click 'Install' to begin installation.",
            Location = new System.Drawing.Point(28, 360),
            Width = 485,
            ForeColor = System.Drawing.Color.FromArgb(70, 75, 90),
            AutoSize = false
        };
        form.Controls.Add(lblStatus);

        // Bottom panel
        var bottom = new System.Windows.Forms.Panel
        {
            Dock = System.Windows.Forms.DockStyle.Bottom,
            Height = 55,
            BackColor = System.Drawing.Color.FromArgb(238, 240, 246)
        };

        bool installed = false;
        var btnInstall = new System.Windows.Forms.Button
        {
            Text = "Install",
            Location = new System.Drawing.Point(310, 12),
            Width = 100,
            Height = 32,
            BackColor = System.Drawing.Color.FromArgb(0, 110, 230),
            ForeColor = System.Drawing.Color.White,
            Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold),
            FlatStyle = System.Windows.Forms.FlatStyle.Flat
        };
        btnInstall.FlatAppearance.BorderSize = 0;

        var btnCancel = new System.Windows.Forms.Button
        {
            Text = "Cancel",
            Location = new System.Drawing.Point(418, 12),
            Width = 95,
            Height = 32,
            BackColor = System.Drawing.Color.White,
            FlatStyle = System.Windows.Forms.FlatStyle.System
        };
        btnCancel.Click += (s, ev) => { form.Close(); };

        btnInstall.Click += async (s, ev) =>
        {
            if (installed)
            {
                form.Close();
                return;
            }

            btnInstall.Enabled = false;
            btnCancel.Enabled = false;
            btnBrowse.Enabled = false;
            txtPath.Enabled = false;
            progress.Visible = true;
            progress.Style = System.Windows.Forms.ProgressBarStyle.Marquee;

            string targetDir = txtPath.Text.Trim();

            try
            {
                // 1. Kill running instances
                lblStatus.Text = "Stopping any running instance...";
                await Task.Run(() =>
                {
                    try
                    {
                        foreach (var name in new[] { "PrintoraServer", "WifiPrintServer" })
                            foreach (var proc in Process.GetProcessesByName(name))
                            {
                                if (proc.Id != Environment.ProcessId)
                                {
                                    proc.Kill();
                                    proc.WaitForExit(3000);
                                }
                            }
                    }
                    catch { }
                });

                // 2. Copy self to install directory
                lblStatus.Text = "Installing application files...";
                Directory.CreateDirectory(targetDir);
                string destExe = Path.Combine(targetDir, "PrintoraServer.exe");

                await Task.Run(() =>
                {
                    File.Copy(sourceExe, destExe, overwrite: true);
                });

                // 3. Desktop shortcut
                if (chkDesktop.Checked)
                {
                    lblStatus.Text = "Creating Desktop shortcut...";
                    string desktopPath = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),
                        "Printora Server.lnk");
                    CreateShortcutViaWsh(destExe, desktopPath, "Printora Server — Cloud & Local Printing");
                }

                // 4. Start Menu shortcut
                if (chkStartMenu.Checked)
                {
                    lblStatus.Text = "Creating Start Menu shortcut...";
                    string startMenuDir = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.Programs),
                        "Printora Server");
                    Directory.CreateDirectory(startMenuDir);
                    CreateShortcutViaWsh(destExe,
                        Path.Combine(startMenuDir, "Printora Server.lnk"),
                        "Printora Server — Cloud & Local Printing");
                }

                // 5. Firewall rule
                if (chkFirewall.Checked)
                {
                    lblStatus.Text = "Configuring Windows Firewall...";
                    await Task.Run(() =>
                    {
                        try
                        {
                            var psi = new ProcessStartInfo
                            {
                                FileName = "netsh",
                                Arguments = "advfirewall firewall add rule name=\"Printora Server\" dir=in action=allow protocol=TCP localport=5000",
                                UseShellExecute = true,
                                CreateNoWindow = true,
                                WindowStyle = ProcessWindowStyle.Hidden
                            };
                            using var p = Process.Start(psi);
                            p?.WaitForExit(5000);
                        }
                        catch { }
                    });
                }

                // Done
                progress.Style = System.Windows.Forms.ProgressBarStyle.Continuous;
                progress.Value = 100;
                lblStatus.Text = "Installation completed successfully!";
                lblStatus.ForeColor = System.Drawing.Color.DarkGreen;
                installed = true;

                // 6. Launch installed copy
                if (chkLaunch.Checked && File.Exists(destExe))
                {
                    try
                    {
                        Process.Start(new ProcessStartInfo(destExe)
                        {
                            WorkingDirectory = targetDir,
                            UseShellExecute = true
                        });
                    }
                    catch { }
                }

                btnInstall.Text = "Finish";
                btnInstall.Enabled = true;
                btnCancel.Visible = false;
            }
            catch (Exception ex)
            {
                progress.Visible = false;
                lblStatus.Text = "Installation failed: " + ex.Message;
                lblStatus.ForeColor = System.Drawing.Color.Red;
                btnInstall.Enabled = true;
                btnCancel.Enabled = true;
                btnBrowse.Enabled = true;
                txtPath.Enabled = true;
            }
        };

        bottom.Controls.Add(btnInstall);
        bottom.Controls.Add(btnCancel);
        form.Controls.Add(bottom);

        // Show installer as modal dialog, then shutdown installer process
        form.ShowDialog();
        Shutdown(0);
    }

    private static void CreateShortcutViaWsh(string targetPath, string shortcutPath, string description)
    {
        try
        {
            Type? shellType = Type.GetTypeFromProgID("WScript.Shell");
            if (shellType != null)
            {
                dynamic? shell = Activator.CreateInstance(shellType);
                if (shell != null)
                {
                    dynamic shortcut = shell.CreateShortcut(shortcutPath);
                    shortcut.TargetPath = targetPath;
                    shortcut.WorkingDirectory = Path.GetDirectoryName(targetPath);
                    shortcut.Description = description;
                    shortcut.IconLocation = targetPath + ",0";
                    shortcut.Save();
                }
            }
        }
        catch { }
    }

    // ═══════════════════════════════════════════════════════════════
    // System tray
    // ═══════════════════════════════════════════════════════════════

    private System.Windows.Forms.NotifyIcon? _trayIcon;
    private static System.Windows.Forms.NotifyIcon? _staticTrayIcon;

    public static void ShowTrayNotification(string title, string message, System.Windows.Forms.ToolTipIcon icon = System.Windows.Forms.ToolTipIcon.Info)
    {
        Current?.Dispatcher.BeginInvoke(() =>
        {
            try { _staticTrayIcon?.ShowBalloonTip(4000, title, message, icon); }
            catch { /* Ignore notification failures */ }
        });
    }

    private void SetupTrayIcon()
    {
        _trayIcon = new System.Windows.Forms.NotifyIcon
        {
            Text = "Printora Cloud Print Server",
            Visible = true
        };
        _staticTrayIcon = _trayIcon;

        // Use a default system icon
        _trayIcon.Icon = System.Drawing.SystemIcons.Application;

        var menu = new System.Windows.Forms.ContextMenuStrip();
        menu.Items.Add("Open Dashboard", null, (s, e) =>
        {
            if (MainWindow is { } mainWindow)
            {
                mainWindow.Show();
                mainWindow.WindowState = WindowState.Normal;
                mainWindow.Activate();
            }
        });
        menu.Items.Add("-");
        menu.Items.Add("Exit", null, (s, e) =>
        {
            _trayIcon.Visible = false;
            Program.Discovery?.Dispose();
            Shutdown();
        });

        _trayIcon.ContextMenuStrip = menu;
        _trayIcon.DoubleClick += (s, e) =>
        {
            if (MainWindow is { } mainWindow)
            {
                mainWindow.Show();
                mainWindow.WindowState = WindowState.Normal;
                mainWindow.Activate();
            }
        };
    }

    protected override void OnExit(ExitEventArgs e)
    {
        try
        {
            var dir = AppSettings.AppDataDir;
            Directory.CreateDirectory(dir);
            File.AppendAllText(Path.Combine(dir, "exit.log"), $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] OnExit called with exit code: {e.ApplicationExitCode}\n");
        }
        catch { }
        _trayIcon?.Dispose();
        Program.TunnelServiceInstance?.Dispose();
        Program.Discovery?.Dispose();
        base.OnExit(e);
    }
}

