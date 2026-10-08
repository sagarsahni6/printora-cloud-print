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
        destination: "https://github.com/sagarsahni6/printora-cloud-print/releases/download/v2.0.0/PrintoraServer-Setup.exe",
        permanent: false,
      },
      {
        source: "/download/windows/portable.zip",
        destination: "https://github.com/sagarsahni6/printora-cloud-print/releases/download/v2.0.0/PrintoraServer-Windows-v2.0.0.zip",
        permanent: false,
      },
      {
        source: "/download/android/app.apk",
        destination: "https://github.com/sagarsahni6/printora-cloud-print/releases/download/v2.0.0/Printora-Android-v2.0.0.apk",
        permanent: false,
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
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
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
