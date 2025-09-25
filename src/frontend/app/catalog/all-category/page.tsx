import React, { Suspense } from 'react';
import { catalogStructure } from '@/lib/catalogStructure';

// Keep the page as a server component — compute static data here and render a client
// component that uses navigation hooks inside a Suspense boundary. This avoids the
// prerender-time hook usage error.
export const dynamic = 'force-dynamic';

import AllCategoryClient from './AllCategoryClient';

const IMAGE_MAP: Record<string, string> = {
  decor: 'decor.jpg',
  frames: 'frames.png',
  vases: 'vases.jpg',
  mirrors: 'mirrors.png',
  candlesticks: 'candlesticks.jpg',
  'jewelry-boxes': 'jewelry-boxes.jpg',
  figurines: 'figurines.jpg',
  clocks: 'clocks.png',
  garden: 'garden.png',

  flowers: 'flowers.jpg',
  compositions: 'compositions.jpg',

  textiles: 'textiles.jpg',
  blankets: 'blankets.png',
  tablecloths: 'tablecloths.jpg',
  'cosmetic-bags': 'cosmetic-bags.png',
  pilows: 'pillows.png',
  pillows: 'pillows.png',
  towels: 'towels.png',

  tableware: 'serving.png',
  dishes: 'dishes.jpg',
  cutlery: 'cutlery.png',
  glasses: 'glasses.png',
  serving: 'serving.png',

  furniture: 'furniture.png',

  'home-fragrances': 'home-fragrances.JPG',
  diffusers: 'diffusers.png',
  bouquets: 'flowers.jpg',
  candles: 'candles.png',
  sprays: 'sprays.png',

  'easter-collection': 'easter-collection.png',

  'new-year': 'new-year.png',
  figures: 'figures.png',
  branches: 'branches.png',
  toys: 'toys.png',
  balls: 'balls.png',
  trees: 'trees.png',
  garlands: 'garlands.png',
  decor_alt: 'decor.jpg',
};

type Item = { title: string; href: string; image: string };

export default function AllCategoryPage() {
  // Build top-level category tiles server-side and pass to the client component.
  const items: Item[] = catalogStructure.map(c => {
    const fileName = IMAGE_MAP[c.slug];
    const POPULAR_ALIASES: Record<string, string> = { textiles: 'textiless.jpg' };
    const catImage = fileName
      ? `/category/${fileName}`
      : `/popular-categories/${POPULAR_ALIASES[c.slug] ?? `${c.slug}.jpg`}`;
    return { title: c.name, href: `/catalog/${c.slug}`, image: catImage };
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl tracking-wider text-center mb-8 text-gray-800 section-heading">Каталог</h1>
      <Suspense fallback={<div className="py-8 text-center text-gray-500">Загрузка...</div>}>
        {/* Client component reads search params and performs client fetches */}
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <AllCategoryClient items={items} />
      </Suspense>
    </main>
  );
}
