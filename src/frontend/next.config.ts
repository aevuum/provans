import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  // serverExternalPackages tells Next to treat these packages as external to server bundles
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
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
    // Отключаем встроенную оптимизацию изображений (уменьшаем размер serverless функций, не тянем sharp)
    unoptimized: true,
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
  // Убираем sharp, чтобы не включался в каждую serverless функцию
  // (Оптимизация размера: теперь используем unoptimized изображения из /public)
  // serverExternalPackages: ['sharp'],

  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      // HSTS только на проде и при HTTPS
      ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
      // Базовая CSP (может требовать корректировок для интеграций)
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          // Allow Yandex Maps
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api-maps.yandex.ru https://yandex.ru https://yastatic.net https://*.yandex.ru https://*.yandex.net",
    // Some browsers use script-src-elem for external scripts
    "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://api-maps.yandex.ru https://yandex.ru https://yastatic.net https://*.yandex.ru https://*.yandex.net",
          "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "img-src 'self' data: blob: http://localhost:3000 http://localhost:3001 https://api-maps.yandex.ru https://yastatic.net https://*.yandex.net https://*.yandex.ru",
    "font-src 'self' data: fonts.gstatic.com",
    "connect-src 'self' http://localhost:3000 http://localhost:3001 https://api-maps.yandex.ru https://yastatic.net https://*.yandex.ru https://*.yandex.net",
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
      // Ensure NextAuth app routes are handled by the frontend app router
      // (don't proxy /api/auth/* to the backend service).
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://backend:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;