'use client';

import React, { useState, useRef, MouseEvent, useEffect } from 'react';
import { resolveImageWithManifest } from '../../lib/imagePath';
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

  // Используем прямой путь без /api/image прокси (упрощение и уменьшение serverless footprint)
  const [imageSrc, setImageSrc] = useState(src);
  useEffect(() => {
    let alive = true;
    resolveImageWithManifest(src).then(r => { if (alive) setImageSrc(r); });
    return () => { alive = false; };
  }, [src]);

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
        className={`overflow-hidden cursor-zoom-in ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{ width: '100%' }}
      >
        {/* Главное изображение без absolute/fill, сжимается вместе с контентом */}
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-auto object-contain transition-transform duration-200 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={{
            transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center',
          }}
        />

  {/* Второе всплывающее окно убрано по требованию */}
      </div>
    </div>
  );
}
