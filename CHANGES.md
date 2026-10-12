# Printora Changelog & Security Audit Resolution (CHANGES.md)

This document tracks all security, architectural, and operational fixes applied to the Printora platform across all five audit phases and the release stabilization sprint.

---

## 1. Summary of Changes by Phase

### Phase 1: Server Security Hardening (`WifiPrintServer`)
- **Brute-Force & Attempt Limiting**:
  - Implemented `AttemptLimiter` service with both per-IP lockout (5 failed attempts per 5 minutes triggers HTTP 429 + `Retry-After`) and global failure protection against IP rotation.
  - Added unit test suite covering single-IP lockout, lockout recovery, and global limit capping.
- **Client IP Resolution**:
  - Centralized IP resolution into `ClientIpResolver`. Only trusts `CF-Connecting-IP` or `X-Forwarded-For` when the immediate TCP peer is loopback (i.e., local `cloudflared` process). Direct connection IP spoofing is completely neutralized.
- **PIN & Token Cryptography**:
  - Replaced pseudo-random BitConverter modulo arithmetic with `RandomNumberGenerator.GetInt32`.
  - Replaced standard string equality with `CryptographicOperations.FixedTimeEquals` to prevent timing attacks on PIN and QR tokens.
  - Implemented 10-minute auto-rotation timer for connection PINs.
- **Session Duration & Device Expiry**:
  - Reduced default `JwtExpirationDays` from 365 to 30.
  - Enforced `SessionDurationMinutes` inside JWT token validation handler (`OnTokenValidated`).
- **Secrets at Rest**:
  - Protected `JwtSecret`, `CertificatePassword`, and `CurrentQrPairingToken` with Windows DPAPI (`ProtectedData`, `CurrentUser` scope).
  - Devices database now stores only SHA-256 hash and token `jti`, removing raw plaintext JWTs from SQLite.
- **CORS & Security Headers**:
  - Restricted CORS to trusted origins: localhost, local network subnets (`NetworkUtils.IsSameLocalSubnet`), `*.trycloudflare.com`, and configured `CustomPublicUrl`.
  - Added security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `HSTS` on HTTPS, and customized Content Security Policy (CSP) for Web Print Studio.
- **Temporary Document Lifecycle**:
  - Auto-cleanup executed on print success, cancellation, or error.
  - Added optional `SecureDeleteOnCleanup` setting that overwrites file bytes with zeroes prior to deletion.
  - Added startup sweep removing orphaned uploads older than 1 hour.
- **SignalR Push Updates**:
  - Implemented `PrintStatusHub` at `/ws/status` with group routing by device ID.

### Phase 2: Android App Hardening (`WifiPrintApp`)
- **Secure Token Storage**:
  - Migrated device tokens from Room SQLite entity into `EncryptedSharedPreferences` backed by Android Keystore (`MasterKey.DEFAULT_MASTER_KEY_ALIAS`).
  - Added migration bridge for existing installations.
- **Permissions & Discovery**:
  - Added `android:usesPermissionFlags="neverForLocation"` to `NEARBY_WIFI_DEVICES`.
  - Cleaned up unused office document intent filters.
- **Target SDK & Toolchain**:
  - Upgraded target SDK to Android 15 (API 35) and resolved manifest/receiver compatibility flags (`RECEIVER_NOT_EXPORTED`).
- **ProGuard / R8 Obfuscation**:
  - Fixed ProGuard stripping generic type signatures (`Response<ApiResponse<AuthResponse>>`) in Retrofit models that previously crashed QR connection callbacks.

### Phase 3: Truthful Copy & Claims Reconciliation
- **Accurate Cryptographic Claims**:
  - Removed misleading claims regarding "military-grade airgap", "E2EE zero cloud", and "100% offline".
  - Clarified transport model: TLS 1.2+ with certificate fingerprint pinning on local networks; Cloudflare edge termination for remote tunnels.
- **Storage Transparency**:
  - Clarified that documents are saved temporarily on the Host PC and purged after printing.
- **OCR Engine Attribution**:
  - Documented use of Google ML Kit for on-device document OCR.

### Phase 4: Website Hardening & Downloads (`website/`)
- **Single Source of Truth**:
  - Consolidated download metadata (version, checksums, file sizes, release notes) into `website/src/config/releases.ts`.
- **Download Gateways**:
  - Added direct download endpoints (`/api/download/windows`, `/api/download/android`, `/api/download/windows-portable`).
- **CSP & Modern Web Standards**:
  - Removed `'unsafe-eval'` from Next.js CSP.
  - Fixed metadata, added OpenGraph and structured data (JSON-LD `SoftwareApplication` and `FAQPage`).

### Phase 5: CI & Quality Gates
- **Continuous Integration (`.github/workflows/ci.yml`)**:
  - Added `dotnet list package --vulnerable --include-transitive` for automated dependency vulnerability auditing.
  - Added `npm audit --omit=dev` and Next.js static build validation.
  - Added Gitleaks secret scanning step and pinned GitHub Actions to immutable versions.
- **Dependabot (`.github/dependabot.yml`)**:
  - Configured automated weekly dependency PRs for nuget, gradle, npm, and github-actions.
- **Security Policy (`SECURITY.md`) & Threat Model (`docs/THREAT_MODEL.md`)**:
  - Published clear vulnerability disclosure guidelines, response SLAs, and architectural threat boundaries.

### Release Stabilization & Packaging
- **Self-Contained Windows Executable**:
  - Published self-contained `win-x64` single-file executable (`PrintoraServer.exe`) bundling the .NET 8 runtime and SQLite native binaries (`e_sqlite3.dll`). Users do not need to download .NET separately.
- **Inno Setup 6 Packaging (`PrintoraSetup.iss`)**:
  - Bundled `PrintoraServer.exe`, custom icon, licensing, and `cloudflared.exe` into a modern Windows setup wizard (`PrintoraServer-Setup.exe` / `PrintoraSetup.exe`).
  - Added automated Windows Firewall rule registration for Port 5000 and desktop/start menu shortcuts.
- **Cloud Connection & Relay Resolution**:
  - Pinned official Cloudflare binary SHA-256 (`c2f4a3c3ea4c62eed562ede027d586a6044d35517e335e642f4e9783e651e4a3`) to prevent fresh install failures.
  - Corrected tunnel launch arguments to always start a Quick Tunnel (`trycloudflare.com`) unless the user explicitly configured a custom domain.
  - Resolved erroneous fallback to `printora.calclabz.com` (marketing site).
  - Configured CORS and CSP to support `*.trycloudflare.com` and Web Print Studio interactive features.

---

## 2. Architectural Decisions (DECISION Log)

1. **AutoApproveSameNetwork Default**:
   - *Decision*: Set to `false` for fresh installations; preserved for existing user settings.
   - *Rationale*: Protects shared/public Wi-Fi environments (coffee shops, shared offices) where other devices on the same LAN should not have immediate unauthorized access to host printers.
2. **EnableCloudRelay Default**:
   - *Decision*: Set to `false` for fresh installations; enabled via explicit toggle on the dashboard.
   - *Rationale*: Remote tunnel routing routes traffic through Cloudflare edge. Users must explicitly opt in with full awareness of the relay architecture.
3. **Legacy PIN Endpoint (`/api/auth/pair`)**:
   - *Decision*: Marked obsolete and disabled by default on new installations (`EnableLegacyPairEndpoint = false`).
   - *Rationale*: Transition to the approval/QR protocol prevents brute-force PIN guessing from unauthorized network clients.
4. **License Designation**:
   - *Decision*: Retained proprietary license in `LICENSE`; updated references across docs and marketing copy to "Source-Available".

---

## 3. Test Verification Metrics

| Component | Test Suite | Tests Passed | Status |
| --------- | ---------- | ------------ | ------ |
| **Server** (`WifiPrintServer.Tests`) | xUnit (.NET 8.0) | **42 / 42** | :white_check_mark: All green |
| **Android** (`WifiPrintApp`) | Gradle JUnit (`:app:testDebugUnitTest`) | Passed | :white_check_mark: All green |
| **Website** (`website`) | Next.js 16.4 Turbopack & ESLint | **39 / 39 routes** | :white_check_mark: All green |

---

## 4. Items Requiring Maintainer Environment

The following items cannot be fully automated without maintainer private credentials or production infrastructure:
1. **Android Production Signing Keystore**: Supply release keystore file and credentials in CI/CD environment secrets (`RELEASE_KEYSTORE_BASE64`, `RELEASE_KEY_ALIAS`, `RELEASE_STORE_PASSWORD`).
2. **Windows Code Signing Certificate**: EV/OV Authenticode certificate for signing `PrintoraServer-Setup.exe` to suppress Windows SmartScreen notices.
3. **Custom Cloudflare Tunnel Token / Domain**: If using a custom permanent domain (`print.yourdomain.com`), configure in Cloudflare Zero Trust and populate `CustomPublicUrl`.
4. **Live Device Screenshots**: Replace UI mockup slots in `/website/public/images/` with real hardware photography for app stores.

---

## 5. Residual Risks

1. **Cloudflare Edge Decryption**: Remote printing relays through Cloudflare edge, which terminates TLS.
2. **SSD Wear-Leveling**: `SecureDeleteOnCleanup` overwrites data before unlinking, but flash drive physical remapping is best-effort.
