You are a senior security-minded engineer working on the Printora monorepo:
- WifiPrintServer/ (.NET 8, WPF + Kestrel, xUnit tests)
- WifiPrintApp/ (Kotlin, Jetpack Compose, Hilt, Room, OkHttp)
- website/ (Next.js, marketing site at printora.calclabz.com)
- README.md, LICENSE, .github/workflows/ci.yml

Goal: fix every issue from the audit below. Read the relevant code before changing it. Work in phases, one commit per phase, and after each phase run `dotnet build` and `dotnet test` (server), `./gradlew :app:testDebugUnitTest :app:lintDebug` (Android), and `npm run lint && npm run build` (website). Do not break the pairing protocol between existing Android clients and the server unless noted. Where a decision needs me (marked DECISION), pick the safest default, implement it behind a setting, and list it in CHANGES.md. Never invent stats, hashes or testimonials; use clear TODO placeholders.

## PHASE 1: Server security (WifiPrintServer)
1. Brute-force protection on /api/auth/request and /api/auth/pair:
   - Add a per-IP (and global) failed-attempt limiter: 5 failures per 5 minutes, then lockout with 429 and Retry-After. Reuse the pattern from WebPrintProtectionService, but extract it into a shared `AttemptLimiter` service with unit tests.
   - Add a global cap, since attackers can rotate IPs.
2. Trusted client IP:
   - Create one `ClientIpResolver`. Only honor Cf-Connecting-Ip / X-Forwarded-For when the TCP peer is loopback (the local cloudflared process). Otherwise use RemoteIpAddress. Replace every ad-hoc header read (AuthController, WebPrintProtectionService, LocalOnlyAttribute) with it.
3. PIN and token hygiene:
   - Replace `Math.Abs(BitConverter...) % N` in GeneratePin and GenerateHostIdentifier with `RandomNumberGenerator.GetInt32`.
   - Use `CryptographicOperations.FixedTimeEquals` for PIN and QR-token comparison.
   - Auto-rotate the connection PIN every 10 minutes (timer) in addition to the manual refresh button, and invalidate it after one successful use.
   - Make the QR pairing token rotatable: add a "Regenerate QR" button in the dashboard that rotates the token, with a warning that printed QR codes stop working.
4. Session lifetime:
   - Default JwtExpirationDays from 365 to 30. Make `SessionDurationMinutes` actually enforced via an exp/iat check in OnTokenValidated (or reject if device.SessionStartedAt is older than the setting when it is > 0). Add tests.
5. Auto-approve:
   - DECISION: set AutoApproveSameNetwork default to false for new installs (keep the existing value for migrated settings). Add a first-run choice in the dashboard: "Home mode (auto-approve my Wi-Fi)" vs "Shop mode (always ask)".
6. Secrets at rest:
   - Protect JwtSecret, CertificatePassword, CurrentQrPairingToken and device JWTs with Windows DPAPI (ProtectedData, CurrentUser scope). Add transparent migration from plaintext settings.json, and tests.
   - Stop storing the raw JWT in the SQLite device table. Store only a hash or the jti, and validate by device id + jti.
7. CORS and headers:
   - Replace AllowAnyOrigin with a restrictive policy (same-origin plus the tunnel/custom public URL). Add security headers middleware (HSTS on HTTPS, X-Content-Type-Options, Referrer-Policy, a CSP for the Web Print page).
8. Cloudflared supply chain:
   - Stop downloading `releases/latest`. Pin a specific cloudflared version and verify its SHA-256 against a hash stored in code (TODO: I will fill in the real hash; fail closed if empty unless a `--allow-unverified-cloudflared` dev flag is set).
9. Certificate:
   - Add certificate rotation/regeneration when the host IP changes or the cert is within 30 days of expiry, and surface the new fingerprint in the QR and dashboard.
10. Remote mode default:
   - DECISION: set EnableCloudRelay default to false for new installs. Show a clear first-run explanation: "Remote printing routes encrypted traffic through Cloudflare. Cloudflare terminates TLS and can technically see the traffic. Files are not stored."
11. File handling:
   - FailJob must also call CleanupJobFiles when AutoCleanupAfterPrint is on.
   - Add an optional `SecureDeleteOnCleanup` setting that overwrites file bytes once before deleting. Be honest in docs that this is best-effort on SSDs.
   - Add a startup sweep that removes orphaned uploads older than 1 hour (not only the 24h timer).
   - LibreOffice conversion: add a 60s timeout with process kill, an isolated user profile dir (-env:UserInstallation), and resolve soffice only from known install paths, not bare PATH.
   - Strengthen content validation: for .docx/.xlsx/.pptx confirm the zip contains the expected entries ([Content_Types].xml); for images, attempt a safe decode; for .txt, reject files with NUL bytes.
   - Reconcile the upload size limits: Kestrel MaxRequestBodySize, FormOptions.MultipartBodyLengthLimit, [RequestSizeLimit] and MaxFileSizeMB must agree.
12. Legacy:
   - Fix the /api/auth/pair comment/behavior mismatch. Mark the endpoint deprecated, apply the same limiter, and add a setting to disable it (default disabled for new installs).
13. SignalR:
   - README and the Hubs folder claim /ws/status SignalR, but it does not exist. DECISION: implement a minimal SignalR hub that pushes PrintQueueManager status events (the event already exists), authenticated with the existing JWT plus the /ws query-string handler. If that is too large, remove all references instead and say so in CHANGES.md.
14. Add tests for each of the above. The server test project must stay green, and the count must go up.

## PHASE 2: Android app (WifiPrintApp)
1. Store the JWT and server info securely: use Android Keystore-backed encryption (EncryptedSharedPreferences or an AES-GCM key in Keystore wrapping the Room token column). Migrate existing data.
2. Manifest and permissions:
   - Drop ACCESS_FINE_LOCATION if mDNS works without it on API 26-32 (otherwise add maxSdkVersion and a clear rationale). Add `android:usesPermissionFlags="neverForLocation"` to NEARBY_WIFI_DEVICES.
   - Remove XLS/PPT intent filters unless the server supports them (see Phase 1 DECISION: simplest is to remove them).
3. Raise compileSdk/targetSdk to the current Play requirement, fix resulting lint and behavior changes, and update outdated dependencies (Compose BOM, CameraX, etc.) conservatively.
4. Release signing: fail the release build if no keystore is configured. Never fall back to the debug key.
5. Pinning UX: on first-use trust, require the user to confirm the certificate fingerprint shown on the PC (or the QR-embedded fingerprint). Do not silently trust the first certificate seen on same-network auto-connect.
6. Replace the "AES-256 E2EE & TLS" label in SettingsScreen with an accurate one: "TLS 1.2+ with certificate pinning (local) / Cloudflare tunnel (remote)".
7. Add unit tests for TlsPinning, token storage migration and the attempt/lockout handling in the client (surface the 429 / Retry-After message clearly).

## PHASE 3: Truthful copy and license (README, website, in-app text)
Fix every claim to match what the code actually does. Search the whole repo (README, website/src, website/seo, Android strings) for: "AES-256", "E2EE", "end-to-end", "in-memory", "RAM", "shred", "zero trace", "leave no trace", "zero cloud", "airgap", "peer-to-peer", "never leave your network", "Tesseract", "100% offline", "4,000+", "1.2s", "No telemetry", "open source".
Replacement guidance:
- Encryption: "TLS encryption with certificate pinning on your local network. In remote mode, traffic is encrypted to Cloudflare's edge and re-encrypted to your PC through a tunnel; Cloudflare terminates TLS and does not store your files."
- Storage: "Files are saved temporarily on your PC and deleted after printing, cancellation or failure (overwritten first if Secure Delete is enabled)."
- Remove airgap, compliance, 4,000+, <1.2s, 99.4% and similar unsubstantiated figures, or link a real benchmark.
- OCR: "On-device text recognition powered by Google ML Kit (via Google Play Services)". Remove "Tesseract" and "100% offline" unless verified. Add a note on any ML Kit telemetry once I confirm it.
- Remove "No tracking or telemetry" unless it is verified true for the whole stack.
- License: DECISION: either (a) switch to MIT/Apache-2.0 and keep "open source", or (b) keep the proprietary LICENSE and change every "open source" mention (footer, terms, download page, support, FAQ, README) to "source-available" or remove it. Default to (b) if I have not answered, and state why.
- Update README: accurate architecture diagram, security table, remove the SignalR claim if not implemented, correct file types and test counts.
- Add a /security page section "What Cloudflare can and cannot see", and a "Threat model & limitations" section in README.

## PHASE 4: Website hardening and downloads
1. Download pages: read version, file size, requirements and SHA-256 from one config file (website/src/config/releases.ts). Show them next to every download button. Align the site version with the actual app (server 2.0.0 vs Android 2.2.2): decide one scheme and publish matching releases.
2. Add a SmartScreen note ("Windows may warn about unsigned apps, here is why and how to verify the checksum"), and an "APK sideloading" help note.
3. CSP: remove 'unsafe-eval'; move to nonce-based script-src if feasible with Next.js, and narrow connect-src and img-src.
4. Dev dependencies: resolve the 5 npm audit highs (eslint-config-next chain) by upgrading, or document why they are dev-only.
5. Move website/printora.app-audit/ and LANDING PAGE.MD out of the public repo (or into /docs/internal and gitignore them).
6. Use the earlier site-audit items: shorten the meta description to 150-160 chars, drop meta keywords, add JSON-LD (SoftwareApplication, FAQPage), en-IN locale, ₹/GST/UPI examples in the OCR demo, real screenshot slots, and tidy the footer.

## PHASE 5: CI and quality gates
- CI: add `dotnet list package --vulnerable --include-transitive`, `npm audit --omit=dev`, an Android dependency check, and secret scanning (gitleaks). Add website lint and build jobs. Pin action versions.
- Add a SECURITY.md (how to report vulnerabilities) and a threat model doc.
- Add Dependabot config for nuget, gradle, npm and github-actions.

## Deliverables
1. Commits per phase with clear messages.
2. CHANGES.md: before/after for each fix, every DECISION taken and why, and a list of things only I can provide (real SHA-256 hashes, license choice, screenshots, signing keystore, Play Store listing).
3. Updated tests: report server test count before/after and Android tests added.
4. A final "residual risks" section listing anything not fixed.

Constraints: no new heavy dependencies; keep existing paired devices working through a migration (re-pair prompts are acceptable only for token format changes, and must be documented); prefer secure defaults for new installs while preserving behavior for upgrades; ask me only for DECISION items you cannot safely default.