import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Ensure Next traces files from the repository root when multiple lockfiles
  // exist so client module ids in the RSC manifest are not absolute paths.
  outputFileTracingRoot: path.resolve(__dirname, '..', '..'),
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
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: false,
  dangerouslyAllowSVG: false,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  async redirects() {
    return [];
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  compress: true,
  serverExternalPackages: ['sharp'],

  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
          "img-src 'self' data: blob: http://localhost:3000 http://localhost:3001",
          "font-src 'self' data: fonts.gstatic.com",
          "connect-src 'self' http://localhost:3000 http://localhost:3001",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
    ];
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/_next/image(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;