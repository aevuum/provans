// app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import  SectionBlog from './components/SectionBlog';
import { SafeImage } from '../components/SafeImage';
import Hero from './components/Hero';
import ProductCardClient from './components/ProductCardClient';
import { Product } from '../types/index';
import PromotionsContent from './discount/PromotionsContent';

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
      <div className="absolute bottom-3 left-2 right-2">
        <div className="bg-white/20 px-2 py-1 sm:px-3 sm:py-2 rounded-xl backdrop-blur-sm w-max max-w-full">
          <h3 className="text-white font-bold text-base sm:text-lg md:text-xl truncate max-w-[90vw] md:max-w-[180px]">{title}</h3>
        </div>
      </div>
    </Link>
  );
};

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
    { title: "Текстиль", image: "/popular-categories/textiless.jpg", href: "/catalog/textiles" },
    { title: "Посуда", image: "/popular-categories/dishes.jpg", href: "/catalog/dishes" },
    { title: "Цветы", image: "/popular-categories/flowers.jpg", href: "/catalog/flowers" },
    { title: "Декор", image: "/popular-categories/decor.jpg", href: "/catalog/decor" },
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
    <main className="font-sans home-hero-shadow site-fabric-bg ">
     
      {/* Hero секция */}
      <Hero />

      {/* Популярные Категории */}
      <section className=" mt-20  md:mt-15 px-4 py-1 md:py-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-wider text-center mb-8 text-gray-800 font-script ">Популярные Категории</h2>
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
        <section className="container mx-auto px-4 pt-6 pb-16 md:pb-20  rounded-2xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Новинки</h2>
          </div>
          <div className="relative min-h-[320px]">
            {/* Левая стрелка */}
            <button
              className="flex items-center justify-center cursor-pointer bg-white shadow-lg rounded-full absolute z-20 hover:shadow-xl transition-shadow w-10 h-10 sm:w-12 sm:h-12 left-0 -translate-x-1/2 top-1/2 -translate-y-1/2"
              onClick={() => scrollByCard('new-products-scroll', -1)}
              aria-label="Прокрутить влево"
              type="button"
            >
              <svg width="20" height="20" fill="none">
                <path d="M12 4l-6 6 6 6" stroke="#667" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

              <div
                id="new-products-scroll"
                className="flex gap-2 lg:gap-3 overflow-x-auto pb-2 md:pb-4 scroll-smooth scrollbar-hide"
                style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}
              >
              {newProducts.map((product) => (
                <div key={product.id} className="new-card flex-none w-72">
                  <ProductCardClient product={product} isNew />
                </div>
              ))}
            </div>

            {/* Правая стрелка */}
            <button
              className="flex items-center justify-center cursor-pointer bg-white shadow-lg rounded-full absolute z-20 hover:shadow-xl transition-shadow w-10 h-10 sm:w-12 sm:h-12 right-0 translate-x-1/2 top-1/2 -translate-y-1/2"
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


      {/* Блог секция */}
      <section className="container mx-auto px-1 mb-16">
       
        <SectionBlog />
        {/* Специальные предложения */}
      </section>

      <PromotionsContent />
      </main>
  );
};