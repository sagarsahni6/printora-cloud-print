# Schema & Structured Data Audit: Printora (printora.calclabz.com)

**Category Score**: 95 / 100  
**Weight**: 10%  
**Status**: High Quality / Video Schema Opportunity (1 Medium Finding)  
**Audit Date**: October 24, 2026

---

## 1. Executive Summary

The structured data implementation adheres strictly to Schema.org standards with zero syntax or JSON-LD parsing errors. Sitewide FAQPage pollution has been completely eliminated; `FAQPage` schema is rendered exclusively on pages featuring visible FAQ components. Additionally, `BreadcrumbList`, `HowTo`, `SoftwareApplication`, `Organization`, and `WebSite` schemas are properly mapped.

The primary improvement opportunity is the addition of **`VideoObject` structured data** for the newly released high-definition product demonstration video (`/printora-product-video.mp4`) featured in `Hero.tsx`.

---

## 2. Key Findings

### 2.1 Missing `VideoObject` Schema for Hero Video (Opportunity)
- **Severity**: Medium (P2)
- **Impact**: Google Search features rich video snippets (video carousels, thumbnail previews, timestamps) for pages declaring `VideoObject` structured data. Printora recently added an HD walkthrough video player directly in the hero section, but does not provide machine-readable metadata.
- **Evidence**:
  In `src/components/Hero.tsx`:
  ```tsx
  <video
    className="w-full h-auto aspect-video object-cover block rounded-2xl"
    autoPlay
    loop
    muted
    playsInline
    preload="auto"
    poster="/printora-video-poster.jpg"
  >
    <source src="/printora-product-video.mp4" type="video/mp4" />
  </video>
  ```
  No corresponding `<script type="application/ld+json">` with `@type: "VideoObject"` exists.
- **Remediation**:
  Add `VideoJsonLd` component to `src/components/JsonLd.tsx`:
  ```tsx
  export function VideoJsonLd() {
    const videoSchema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": "Printora Wireless & Remote Printing Software Walkthrough",
      "description": "Watch how Printora turns any Windows PC into a local Wi-Fi print host for Android phones, iPhones via QR Web Print, and remote printing via Cloudflare Tunnel.",
      "thumbnailUrl": "https://printora.calclabz.com/printora-video-poster.jpg",
      "uploadDate": "2026-10-24T12:00:00+05:30",
      "contentUrl": "https://printora.calclabz.com/printora-product-video.mp4",
      "embedUrl": "https://printora.calclabz.com",
      "publisher": {
        "@type": "Organization",
        "name": "CalcLabz",
        "url": "https://calclabz.com"
      }
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />
    );
  }
  ```
  Render `<VideoJsonLd />` on the homepage (`src/app/page.tsx`).

---

## 3. Schema Verification Status

| Schema Type | Location | Status | Validation Note |
|---|---|---|---|
| `SoftwareApplication` | Sitewide (`JsonLd.tsx`) | PASS | Declares v2.2.3, Windows 10/11, Android 8.0+, $0 offer |
| `Organization` | Sitewide (`JsonLd.tsx`) | PASS | Declares parent organization CalcLabz and GitHub links |
| `WebSite` | Sitewide (`JsonLd.tsx`) | PASS | Declares site name, description, and canonical root |
| `BreadcrumbList` | All 29 Subpages | PASS | Ordered position hierarchy matching URL taxonomy |
| `HowTo` | 8 Procedural Guides | PASS | Step-by-step instructions with tools and supplies |
| `FAQPage` | `/`, `/faq`, and guides | PASS | 100% matched to visible DOM accordions (Google compliant) |
| `VideoObject` | Homepage (`Hero.tsx`) | **RECOMMENDED** | Rich snippet opportunity for `/printora-product-video.mp4` |
