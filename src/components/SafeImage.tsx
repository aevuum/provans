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
  onClick
}) => {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Мемоизируем обработчики
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

  // Если есть кириллица или пробелы в пути, используем наш API
  const needsProxy = /[а-яё\s]/i.test(src);
  const imageSrc = needsProxy 
    ? `/api/image?path=${encodeURIComponent(src)}`
    : src;

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

  const imageProps = {
    src: imageSrc,
    alt: alt || '',
    priority,
    className: `${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`,
    onLoad: handleLoad,
    onError: handleError,
    style,
    ...(fill 
      ? { fill: true, sizes: sizes || '100vw' }
      : { width, height }
    )
  };

  return (
    <div 
      className={`relative ${fill ? 'w-full h-full' : ''} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {isLoading && (
        <div 
          className={`absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center z-10 ${fill ? '' : 'rounded'}`}
          style={fill ? {} : { width, height }}
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
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
