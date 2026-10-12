# Printora Threat Model & Security Analysis

**Version**: 2.0.1  
**Last Updated**: October 2026  
**Status**: Active  

---

## 1. System Overview & Architecture

Printora is a multi-component document printing system composed of:
1. **Printora Server (`WifiPrintServer`)**: Windows service/tray app hosting an ASP.NET Core Kestrel backend on port 5000 and managing native Windows spooler queues.
2. **Printora Android App (`WifiPrintApp`)**: Jetpack Compose mobile application for discovering servers, scanning documents via CameraX/ML Kit, and dispatching print jobs.
3. **Web Print Studio (`AdminController` / embedded SPA)**: Zero-install browser interface for iOS and guest users.
4. **Cloudflare Tunnel (`cloudflared`)**: Subprocess providing inbound relay for devices on external networks (4G/5G/remote Wi-Fi).

---

## 2. Trust Boundaries & Data Flow

```
[ Android App ] --(Local Wi-Fi: TLS 1.2+ Pinning)------------+
                                                              |
[ Guest Browser ] --(Local Wi-Fi: HTTPS)---------------------+--> [ Kestrel Server :5000 ]
                                                              |          |
[ Remote Client ] --(HTTPS)--> [ Cloudflare Edge ]            |          |--> [ Windows Spooler ]
                                       |                      |          |--> [ Local SQLite DB ]
                                (QUIC / Tunnel)               |          +--> [ Temp Disk Files ]
                                       v                      |
                                [ cloudflared ] ------------->+
```

### Trust Boundary 1: Local Network (LAN / Wi-Fi)
- **Threat**: Malicious actors on the same Wi-Fi network attempting to eavesdrop on printed documents or flood printers.
- **Mitigation**:
  - Mutual TLS verification via TOFU (Trust On First Use) certificate fingerprint pinning in the Android app.
  - Device approval workflow: In "Shop mode", every connection requires Host PC approval or 6-digit PIN entry.
  - Per-IP attempt limiting (5 failed attempts / 5 mins triggers lockout).

### Trust Boundary 2: Remote / Cloud Relay (Cloudflare Tunnel)
- **Threat**: Public internet attackers finding the ephemeral `trycloudflare.com` URL and submitting unauthorized print jobs.
- **Mitigation**:
  - Remote requests cannot be auto-approved even if `AutoApproveSameNetwork` is enabled.
  - Requests must submit the active 6-digit rotating PIN (refreshed every 10 minutes) or await interactive 1-click admin approval from the Host PC toast/dashboard.
  - Web Print quotas enforce max 3 copies, max 30 pages per PDF, and rate limiting (2 jobs/min, 15 jobs/hr per IP).

### Trust Boundary 3: Host PC Storage & Secrets
- **Threat**: Local file access by other user accounts or recovery of printed documents from temporary folders.
- **Mitigation**:
  - All secrets (`JwtSecret`, `CertificatePassword`, `CurrentQrPairingToken`) are protected using Windows DPAPI scoped to the `CurrentUser`.
  - Stored paired devices only retain cryptographic hashes/JTIs, never raw tokens.
  - Temporary print files are purged immediately upon job completion or cancellation. When `SecureDeleteOnCleanup` is enabled, file bytes are overwritten with zeroes before deletion.

---

## 3. What Cloudflare Can and Cannot See

| Category | What Cloudflare Sees | What Cloudflare Cannot See |
| -------- | -------------------- | -------------------------- |
| **Transport** | Requests arrive at Cloudflare edge; TLS is terminated at edge. | Traffic inside the Host PC between `cloudflared` and Kestrel. |
| **Payloads** | Cloudflare edge processes HTTP request headers and payload streams. | Documents after spooling to the physical printer. |
| **Storage** | Cloudflare proxies traffic in-flight; does not retain documents. | Host PC files, database, or print queue history. |

---

## 4. Residual Risks & Accepted Limitations

1. **Cloudflare Edge Decryption**: When Cloud Relay is enabled, Cloudflare operates as a TLS termination proxy. Users with strict zero-knowledge requirements should use Local Wi-Fi mode or self-host a private VPN (e.g., WireGuard/Tailscale).
2. **SSD Secure Erase**: `SecureDeleteOnCleanup` overwrites file bytes with zeroes, but flash wear-leveling algorithms on SSDs mean physical sectors may retain historical data.
3. **SmartScreen Warning on First Install**: Unsigned Windows installer binaries will display a Windows SmartScreen warning until certificate reputation builds. Checksums (SHA-256) are provided for independent verification.
