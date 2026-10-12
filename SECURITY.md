# Security Policy

Printora takes the security and privacy of our users, their documents, and their networks seriously.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Printora (Server, Android App, or Web Print Studio), please disclose it responsibly.

- **Email**: Send details to [security@calclabz.com](mailto:security@calclabz.com) or [support@calclabz.com](mailto:support@calclabz.com).
- **PGP/Encrypted**: If the issue is critical, request our PGP public key prior to sending attachments.
- **Response Timeline**: We acknowledge receipt of vulnerability reports within 48 hours and provide a remediation timeline within 7 days.
- **Public Disclosure**: We request that you give us reasonable time to investigate and patch the issue before making any public disclosure.

Please include:
1. Component affected (WifiPrintServer, WifiPrintApp, or Website / Web Studio).
2. Reproduction steps or proof-of-concept.
3. Potential impact and severity assessment.

---

## Threat Model & Security Architecture

### 1. Local Network Printing (Default Mode)
- **Transport**: Encrypted using TLS 1.2+ with an auto-generated self-signed certificate.
- **Certificate Pinning**: The Android app verifies the SHA-256 certificate fingerprint advertised via mDNS/UDP beacon or scanned from the server QR code (TOFU with user confirmation).
- **Authentication**: Authentication tokens (JWT) are signed with a 384-bit secret protected at rest by Windows DPAPI (`ProtectedData`).
- **Access Control**: Connecting devices on the local network can be auto-approved (Home mode) or prompted for admin approval / 6-digit rotating PIN (Shop mode).

### 2. Remote Cloud Printing (Cloudflare Tunnel)
- **Transport**: Proxied through an ephemeral Cloudflare Quick Tunnel (`*.trycloudflare.com`) or a dedicated named tunnel configured by the user.
- **Trust Boundary**:
  - *What Cloudflare sees*: Cloudflare terminates public TLS at their edge network and forwards requests to the local `cloudflared` daemon over a secure QUIC/HTTP2 tunnel. Cloudflare can inspect HTTP headers and payloads in transit.
  - *What Cloudflare does not see*: Documents are processed in-flight and are never stored on Cloudflare servers or cached permanently.
  - *Local PC storage*: Documents received are temporarily saved to `%LOCALAPPDATA%\Printora\Uploads` and deleted immediately upon print completion, cancellation, or error (optionally overwritten with zeros when `SecureDeleteOnCleanup` is enabled).
- **Authentication**: Devices connecting over the Cloudflare tunnel must either provide the valid rotating 6-digit PIN or wait for explicit 1-click admin approval from the Host PC dashboard or notification toast.

### 3. Brute-Force & Rate Limiting
- Failed pairing and connection requests are rate-limited per client IP (5 failures in 5 minutes triggers a 429 lockout).
- Global rate limits mitigate distributed IP rotation attacks.
- Web Print Studio submissions are capped per IP per minute and hour, with page count and copy limits.

### 4. Client Secrets Storage
- Android client auth tokens are stored using Android Keystore-backed encrypted storage (`EncryptedSharedPreferences`).
- Server secrets (JWT secret, certificate password, QR pairing token) are encrypted using Windows DPAPI (CurrentUser scope).
