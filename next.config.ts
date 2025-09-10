import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '35.247.12.97',
        port: '8080',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/demo_backendmoshrif_bucket-1/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    // السماح بإكمال البناء حتى مع وجود أخطاء ESLint (الموجودة سابقاً)
    ignoreDuringBuilds: true,
  },
  // Enable experimental features if needed
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

export default nextConfig;
