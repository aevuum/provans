import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      // Allow Railway previews/prod
      {
        protocol: 'https',
        hostname: '**.railway.app',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // serve originals to avoid loader issues in minimal envs
    unoptimized: true,
    dangerouslyAllowSVG: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
  '@': require('path').resolve(__dirname, 'src/app'),
    };
    return config;
  },

  async redirects() {
    return [];
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  compress: true,
};

export default nextConfig;
