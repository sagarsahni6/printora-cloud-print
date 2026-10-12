import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      {
        source: "/download/windows/setup.exe",
        destination: "/api/download/windows",
        permanent: false,
      },
      {
        source: "/download/windows/portable.zip",
        destination: "/api/download/windows-portable",
        permanent: false,
      },
      {
        source: "/download/android/app.apk",
        destination: "/api/download/android",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/:hostId([A-Za-z0-9_-]+-[0-9]{4,6})",
        destination: "https://relay.calclabz.com/:hostId",
      },
      {
        source: "/:hostId([A-Za-z0-9_-]+-[0-9]{4,6})/:path*",
        destination: "https://relay.calclabz.com/:hostId/:path*",
      },
      {
        source: "/api/web/:path*",
        destination: "https://relay.calclabz.com/api/web/:path*",
      },
      {
        source: "/api/admin/:path*",
        destination: "https://relay.calclabz.com/api/admin/:path*",
      },
      {
        source: "/api/auth/:path*",
        destination: "https://relay.calclabz.com/api/auth/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https: wss:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
