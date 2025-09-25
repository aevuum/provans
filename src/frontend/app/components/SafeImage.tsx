"use client";

import Image, { ImageProps } from 'next/image';
import React from 'react';
import { resolveImageWithManifest } from '../../lib/imagePath';

export type SafeImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  src?: string | null;
  alt?: string | null;
  fallbackSrc?: string;
};

/**
 * Безопасный Image-обёртка: не падает на пустых/битых src, нормализует относительные пути.
 */
export const SafeImage: React.FC<SafeImageProps> = ({ src, alt, fallbackSrc = '/fon.png', ...rest }) => {
  const [resolved, setResolved] = React.useState(fallbackSrc);
  React.useEffect(() => {
    let alive = true;
  resolveImageWithManifest(src).then((r: string) => { if (alive) setResolved(r || fallbackSrc); });
    return () => { alive = false; };
  }, [src, fallbackSrc]);

  return <Image src={resolved} alt={alt ?? ''} {...rest} />;
};

export default SafeImage;
