import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Оптимизация изображений
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/инста/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/ФОТО/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/instagram/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3004',
        pathname: '/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['localhost'],
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Оптимизация компиляции
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Сжатие
  compress: true,
  
  // Серверные пакеты
  serverExternalPackages: ['sharp'],
  
  // Экспериментальные функции  
  experimental: {
    // Убираем optimizeCss так как нет critters
  },
  
  // Заголовки для кэширования
  async headers() {
    return [
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;