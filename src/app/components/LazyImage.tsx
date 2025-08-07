'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

export function LazyImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  fill = false,
  sizes,
  priority = false 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Загружаем за 50px до появления
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Скелетон загрузки */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      {/* Изображение загружается только когда видно */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          sizes={sizes}
          priority={priority}
          onLoad={() => setIsLoaded(true)}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </div>
  );
}
