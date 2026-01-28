import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.clerk.dev', 'i.pravatar.cc']
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/fonts/:path*',
        destination: 'https://fonts.googleapis.com/:path*'
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/favicon.ico',
        permanent: true
      }
    ];
  }
};

export default nextConfig;
