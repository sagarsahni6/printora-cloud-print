; Script generated for Printora Server
; Inno Setup 6 Script

#define MyAppName "Printora Server"
#define MyAppVersion "2.0.1"
#define MyAppPublisher "Printora"
#define MyAppURL "https://printora.calclabz.com"
#define MyAppExeName "PrintoraServer.exe"

[Setup]
; Basic Information
AppId={{C78DF259-86BC-4B47-B9C0-55B1FF082F89}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Destination Folder
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; Permissions & Privileges
; "lowest" allows standard user install without UAC prompt (installs to %LOCALAPPDATA%\Programs)
; "dialog" prompts the user with "Install for all users (admin)" vs "Install for me only"
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog commandline

; Output
OutputDir=release-output
OutputBaseFilename=PrintoraServer-Setup
SetupIconFile=app.ico
UninstallDisplayIcon={app}\{#MyAppExeName}

; Compression
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern

; Application handling
CloseApplications=yes
CloseApplicationsFilter=*{#MyAppExeName}*

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "firewall"; Description: "Allow Port 5000 in Windows Firewall (Recommended for Android / LAN)"; GroupDescription: "Network Configuration:"

[Files]
Source: "release-output\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "release-output\LICENSE"; DestDir: "{app}"; Flags: ignoreversion; DestName: "LICENSE.txt"
Source: "app.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "release-output\cloudflared.exe"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist

[Icons]
Name: "{autoprograms}\{#MyAppName}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\app.ico"
Name: "{autoprograms}\{#MyAppName}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\app.ico"; Tasks: desktopicon

[Run]
; Add Firewall rule if task selected
Filename: "netsh"; Parameters: "advfirewall firewall add rule name=""Printora Server"" dir=in action=allow protocol=TCP localport=5000"; Flags: runhidden; Tasks: firewall
; Post-install launch option
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "netsh"; Parameters: "advfirewall firewall delete rule name=""Printora Server"""; Flags: runhidden
