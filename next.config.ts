import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  // Alamat dev yang diizinkan mengakses server (lokal + LAN kantor).
  allowedDevOrigins: ['127.0.0.1', 'localhost', '10.10.5.12', '10.10.5.150'],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          // `Strict-Transport-Security`: Memaksa browser menggunakan HTTPS.
          // Diaktifkan saat aplikasi sudah berjalan di belakang HTTPS (produksi).
          // {
          //   key: "Strict-Transport-Security",
          //   value: "max-age=31536000; includeSubDomains; preload",
          // },
        ],
      },
    ];
  },
};

export default nextConfig;
