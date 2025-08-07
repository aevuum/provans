'use client';

import React, { useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';

interface ImageZoomProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function ImageZoom({ src, alt, width = 600, height = 600, className = '' }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  return (
    <div className="relative">
      <div
        ref={imageRef}
        className={`relative overflow-hidden cursor-zoom-in ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{ width, height }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover transition-transform duration-200 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={{
            transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center',
          }}
        />
        
        {/* Увеличенное изображение в отдельном блоке */}
        {isZoomed && (
          <div className="absolute top-0 left-full ml-4 w-80 h-80 border border-gray-300 bg-white shadow-xl z-50 overflow-hidden">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover"
              style={{
                transform: `scale(2) translate(-${zoomPosition.x/2}%, -${zoomPosition.y/2}%)`,
                transformOrigin: '0 0',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
