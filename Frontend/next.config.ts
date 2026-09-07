import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.becdex.com/api",
  },

  // Aktifkan kompresi gzip/brotli untuk semua response
  compress: true,


  images: {
    // Format modern: AVIF (terkecil) → WebP → fallback JPEG/PNG
    formats: ["image/avif", "image/webp"],
    // Izinkan semua remote image (untuk foto profil perusahaan dari API)
    remotePatterns: [
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "**" },
    ],
    // Ukuran image yang umum dipakai (mencegah over-fetch)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Caching header untuk aset statis
  async headers() {
    return [
      {
        source: "/(.*\\.webp|.*\\.avif|.*\\.png|.*\\.jpg|.*\\.svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
