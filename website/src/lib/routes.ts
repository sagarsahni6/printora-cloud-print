/**
 * Utility functions for detecting route types across Printora web applications.
 */

const MARKETING_PREFIXES = new Set([
  "",
  "api",
  "compare",
  "compatibility",
  "download",
  "faq",
  "features",
  "guides",
  "how-it-works",
  "id-card-scanner-to-pdf",
  "mobile-document-scanner-to-pdf",
  "print-from-android-to-windows-printer",
  "print-from-ipad-to-windows-printer",
  "print-from-iphone-to-windows-printer",
  "print-from-phone-to-usb-printer",
  "privacy",
  "qr-code-web-printing",
  "remote-printing-from-phone",
  "security",
  "support",
  "terms",
]);

/**
 * Checks if the current pathname corresponds to a dedicated host Web Print Studio route (e.g. /DESKTOP-PLK2AIK-91413).
 * When true, marketing navigation headers, marketing footers, and promotional banners should not be rendered.
 */
export function isHostPortalRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return false;
  const first = segments[0].toLowerCase();
  return !MARKETING_PREFIXES.has(first);
}
