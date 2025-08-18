'use client';

import Image from 'next/image';
import { useState, memo, useCallback } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  aboveTheFold?: boolean; // для контента в первом экране
}

const SafeImage = memo<SafeImageProps>(({
  src,
  alt,
  width,
  height,
  className = '',
  fill,
  priority = false,
  sizes,
  style,
  onClick,
  aboveTheFold = false
}) => {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
    setIsLoading(false);
  }, []);

  const handleClick = useCallback(() => {
    if (onClick && !isLoading && !error) {
      onClick();
    }
  }, [onClick, isLoading, error]);

  // Используем только прямой путь, без проксирования через /api/image
  const imageSrc = src;

  if (error) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? { position: 'absolute', inset: 0, ...style } : { width, height, ...style }}
        onClick={handleClick}
      >
        <span className="text-gray-500 text-sm">Нет фото</span>
      </div>
    );
  }

  const effectivePriority = priority || aboveTheFold;

  const imageProps = {
    src: imageSrc,
    alt: alt || '',
    priority: effectivePriority,
    className: `${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200 ${className}`,
    onLoad: handleLoad,
    onError: handleError,
    style,
    loading: effectivePriority ? ('eager' as const) : ('lazy' as const),
    decoding: 'async' as const,
    ...(fill || (!width && !height)
      ? { fill: true, sizes: sizes || '100vw' }
      : { width, height }
    )
  } as const;

  return (
    <div
      className={`relative ${(fill || (!width && !height)) ? 'w-full h-full' : ''} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {isLoading && (
        <div
          className={`absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center z-10 ${fill ? '' : 'rounded'}`}
          style={fill ? {} : { width, height }}
        >
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        {...imageProps}
        alt={alt || ''}
      />
    </div>
  );
});

SafeImage.displayName = 'SafeImage';

export { SafeImage };