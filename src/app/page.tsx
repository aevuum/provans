// app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCardClient from '@/app/components/ProductCardClient';
import { Product } from '@/types';
import { SafeImage } from '@/components/SafeImage';
import InstagramSection from '@/app/components/InstagramSection';

const CategoryCard = ({
  title,
  bgImage,
  href
}: {
  title: string;
  bgImage: string;
  href: string;
}) => {
  return (
    <Link
      href={href}
      className="block relative aspect-square rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <SafeImage
        src={bgImage}
        alt={title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-5 left-4 right-4">
        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm w-max">
          <h3 className="text-white font-bold text-lg">{title}</h3>
        </div>
      </div>
    </Link>
  );
};

const backgrounds = [
  { image: '/фон1.png', text: 'ДО 30% НА ИСКУССТВО СОЗДАНИЯ УЮТА', color: 'text-white' }
];

export default function Home() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [specialProducts, setSpecialProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [newResponse, discountResponse] = await Promise.all([
          fetch('/api/products?type=new&limit=20&sortBy=createdAt&sortOrder=desc'),
          fetch('/api/products?type=discount&limit=8&sortBy=discount&sortOrder=desc')
        ]);

        const [newData, discountData] = await Promise.all([
          newResponse.json(),
          discountResponse.json()
        ]);

        if (newData?.success && newData.data?.products) setNewProducts(newData.data.products);
        if (discountData?.success && discountData.data?.products) setSpecialProducts(discountData.data.products);
      } catch (e) {
        console.error('Ошибка загрузки данных для главной страницы:', e);
      }
    };

    fetchHomeData();
  }, []);

  const categories = [
    { title: "Вазы", image: "/popular-categories/vases.jpg", href: "/catalog/vases" },
    { title: "Подсвечники", image: "/popular-categories/candlesticks.jpg", href: "/catalog/candlesticks" },
    { title: "Рамки", image: "/popular-categories/frames.jpg", href: "/catalog/frames" },
    { title: "Цветы", image: "/popular-categories/flowers.jpg", href: "/catalog/flowers" },
    { title: "Шкатулки", image: "/popular-categories/jewelry-boxes.jpg", href: "/catalog/jewelry-boxes" },
    { title: "Фигурки", image: "/popular-categories/figurines.jpg", href: "/catalog/figurines" }
  ];

  const scrollByCard = (containerId: string, direction: 1 | -1) => {
    const scroller = document.getElementById(containerId);
    if (!scroller) return;
    const card = scroller.querySelector('.new-card') as HTMLElement | null;
    const gap = 24;
    const delta = card ? card.offsetWidth + gap : 300;
    scroller.scrollBy({ left: direction * delta, behavior: 'smooth' });
  };

  return (
    <main className="font-sans">
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-screen">
        <div className="absolute inset-0 overflow-hidden">
          {backgrounds.map((bg, index) => (
            <Image
              key={bg.image}
              src={bg.image}
              alt="Provans Decor"
              fill
              className={`object-cover transition-opacity duration-1000 ${index === 0 ? 'opacity-100' : 'opacity-0 absolute'}`}
              priority={index === 0}
            />
          ))}
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <div className="backdrop-blur-sm bg-white/10 p-8 rounded-3xl max-w-2xl border border-white/20 mt-[-150px] md:mt-[-250px]">
            <h1 className={`text-3xl md:text-4xl font-bold leading-[1.3] mb-8 ${backgrounds[0].color}`}>
              {backgrounds[0].text}
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/discount"
                className="inline-flex items-center justify-center bg-[#E5D3B3] hover:bg-[#D4C2A1] border-2 border-[#D4C2A1] hover:border-[#C3B190] text-[#7C5C27] font-bold py-4 px-10 rounded-full text-lg tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Подробнее
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Популярные Категории */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-center mb-8 text-gray-800">Популярные Категории</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.title}
              title={category.title}
              bgImage={category.image}
              href={category.href}
            />
          ))}
        </div>
      </section>

      {/* Новинки */}
      {newProducts.length > 0 && (
        <section className="container mx-auto px-4 pt-6 pb-16 md:pb-20 bg-mint-50 rounded-2xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Новинки</h2>
          </div>
          <div className="relative">
            <button
              className="flex items-center justify-center cursor-pointer bg-white shadow-lg rounded-full absolute z-20 hover:shadow-xl transition-shadow w-10 h-10 sm:w-12 sm:h-12 left-2 sm:left-2 md:left-[-24px] top-1/2 -translate-y-1/2"
              onClick={() => scrollByCard('new-products-scroll', -1)}
              aria-label="Прокрутить влево"
              type="button"
            >
              <svg width="20" height="20" fill="none">
                <path d="M12 4l-6 6 6 6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div
              id="new-products-scroll"
              className="flex gap-4 lg:gap-6 overflow-x-auto pb-2 md:pb-4 scroll-smooth scrollbar-hide"
              style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}
            >
              {newProducts.map((product) => (
                <div key={product.id} className="new-card flex-none w-72">
                  <ProductCardClient product={product} isNew />
                </div>
              ))}
            </div>

            <button
              className="flex items-center justify-center cursor-pointer bg-white shadow-lg rounded-full absolute z-20 hover:shadow-xl transition-shadow w-10 h-10 sm:w-12 sm:h-12 right-2 sm:right-2 md:right-[-24px] top-1/2 -translate-y-1/2"
              onClick={() => scrollByCard('new-products-scroll', 1)}
              aria-label="Прокрутить вправо"
              type="button"
            >
              <svg width="20" height="20" fill="none">
                <path d="M8 4l6 6-6 7" stroke="#667" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <style jsx global>{`
            #new-products-scroll::-webkit-scrollbar { display: none; }
            #new-products-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
        </section>
      )}

      {/* Специальные предложения */}
      {specialProducts.length > 0 && (
        <section className="container mx-auto px-4 pt-6 pb-16 md:pb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Специальное предложение</h2>
          </div>
        <div className="relative">
          <button
            className="flex items-center justify-center cursor-pointer bg-white shadow rounded-full absolute z-20 w-12 h-12 left-2 md:left-[-24px] top-1/2 -translate-y-1/2"
            onClick={() => { document.getElementById('special-products-scroll')?.scrollBy({ left: -300, behavior: 'smooth' }); }}
            aria-label="Прокрутить влево"
            type="button"
          >
            <svg width="20" height="20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div id="special-products-scroll" className="flex gap-4 overflow-x-auto pb-2 md:pb-4 scroll-smooth scrollbar-hide" style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}>
            {specialProducts.map((product) => (
              <ProductCardClient key={product.id} product={product} />
            ))}
          </div>
          <button
            className="flex items-center justify-center cursor-pointer bg-white shadow rounded-full absolute z-20 w-12 h-12 right-2 md:right-[-24px] top-1/2 -translate-y-1/2"
            onClick={() => { document.getElementById('special-products-scroll')?.scrollBy({ left: 300, behavior: 'smooth' }); }}
            aria-label="Прокрутить вправо"
            type="button"
          >
            <svg width="20" height="20" fill="none">
              <path d="M8 4l6 6-6 7" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <style jsx global>{`
          #special-products-scroll::-webkit-scrollbar { display: none; }
          #special-products-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </section>
      )}

      {/* Instagram секция */}
      <section className="container mx-auto px-4 mb-16">
        <InstagramSection />
      </section>
    </main>
  );
}