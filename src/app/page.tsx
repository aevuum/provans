// app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCardClient from '@/app/components/ProductCardClient';
import InstagramSection from '@/app/components/InstagramSection';
import { Product } from '@/types';

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
      <Image
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
  { image: '/fon-q.png', text: 'ДО 30% НА ИСКУССТВО СОЗДАНИЯ УЮТА', color: 'text-white' }
];

export default function Home() {
  const [currentBg, setCurrentBg] = useState(0);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [specialProducts, setSpecialProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Убираем анимацию смены фонов, так как теперь только один фон
    setCurrentBg(0);
    
    // Загружаем данные
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {      
      // Параллельно загружаем новинки и акции
      const [newResponse, discountResponse] = await Promise.all([
        fetch('/api/products-new?type=new&limit=10&sortBy=createdAt&sortOrder=desc'),
        fetch('/api/products-new?type=discount&limit=8&sortBy=discount&sortOrder=desc')
      ]);

      const [newData, discountData] = await Promise.all([
        newResponse.json(),
        discountResponse.json()
      ]);

      if (newData.success && newData.data) {
        setNewProducts(newData.data);
      }

      if (discountData.success && discountData.data) {
        setSpecialProducts(discountData.data);  
      }

    } catch (error) {
      console.error('Ошибка загрузки данных для главной страницы:', error);
    }
  };

  const categories = [
    { title: "Вазы", image: "/популярные категории/Вазы.jpg", href: "/catalog/vases" },
    { title: "Подсвечники", image: "/популярные категории/подсвечик.jpg", href: "/catalog/candlesticks" },
    { title: "Рамки", image: "/популярные категории/рамки.jpg", href: "/catalog/frames" },
    { title: "Цветы", image: "/популярные категории/цветы.jpg", href: "/catalog/flowers" },
    { title: "Шкатулки", image: "/популярные категории/шкатулка1.jpg", href: "/catalog/boxes" },
    { title: "Фигурки", image: "/популярные категории/фигурки.jpg", href: "/catalog/figurines" }
  ];

  return (
    <main className="font-sans">
      {/* Hero Section */}
      <section className="relative h-screen">
        <div className="absolute inset-0 overflow-hidden">
          {backgrounds.map((bg, index) => (
            <Image
              key={bg.image}
              src={bg.image}
              alt="Provans Decor"
              fill
              className={`object-cover transition-opacity duration-1000 ${index === currentBg ? 'opacity-100' : 'opacity-0 absolute'}`}
              priority={index === 0}
            />
          ))}
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <div className="backdrop-blur-sm bg-white/10 p-8 rounded-3xl max-w-2xl border border-white/20 mt-[-250px]">
            <h1 className={`text-3xl md:text-4xl font-bold leading-[1.3] mb-8 ${backgrounds[currentBg].color}`}>
              {backgrounds[currentBg].text}
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/catalog/promotions"
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
        <section className="container mx-auto px-4 pt-6 pb-16 md:pb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Новинки</h2>
          </div>
        <div className="relative">
          {/* Стрелка влево */}
          <button
            className="hidden lg:flex items-center justify-center cursor-pointer bg-white shadow-lg rounded-full absolute z-20 hover:shadow-xl transition-shadow"
            style={{
              width: 48,
              height: 48,
              left: '-24px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            onClick={() => {
              document.getElementById('new-products-scroll')?.scrollBy({ left: -320, behavior: 'smooth' });
            }}
            aria-label="Прокрутить влево"
            type="button"
          >
            <svg width="20" height="20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Лента товаров */}
          <div
            id="new-products-scroll"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:flex lg:overflow-x-auto lg:gap-6 pb-2 md:pb-4 scroll-smooth scrollbar-hide"
            style={{
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none'
            }}
          >
            {newProducts.map((product) => (
              <div key={product.id} className="flex-none w-full lg:w-64">
                <ProductCardClient product={product} isNew />
              </div>
            ))}
          </div>
          {/* Стрелка вправо */}
          <button
            className="hidden lg:flex items-center justify-center cursor-pointer bg-white shadow-lg rounded-full absolute z-20 hover:shadow-xl transition-shadow"
            style={{
              width: 48,
              height: 48,
              right: '-24px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            onClick={() => {
              document.getElementById('new-products-scroll')?.scrollBy({ left: 320, behavior: 'smooth' });
            }}
            aria-label="Прокрутить вправо"
            type="button"
          >
            <svg width="20" height="20" fill="none">
              <path d="M8 4l6 6-6 6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
          {/* Стрелка влево */}
          <button
            className="hidden md:flex items-center justify-center cursor-pointer bg-white shadow rounded-full absolute z-20"
            style={{
              width: 44,
              height: 44,
              left: '-32px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            onClick={() => {
              document.getElementById('special-products-scroll')?.scrollBy({ left: -300, behavior: 'smooth' });
            }}
            aria-label="Прокрутить влево"
            type="button"
          >
            <svg width="24" height="24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Лента товаров */}
          <div
            id="special-products-scroll"
            className="flex gap-4 overflow-x-auto pb-2 md:pb-4 scroll-smooth scrollbar-hide"
            style={{
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none'
            }}
          >
            {specialProducts.map((product) => (
              <ProductCardClient key={product.id} product={product} />
            ))}
          </div>
          {/* Стрелка вправо */}
          <button
            className="hidden md:flex items-center justify-center cursor-pointer bg-white shadow rounded-full absolute z-20"
            style={{
              width: 44,
              height: 44,
              right: '-32px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            onClick={() => {
              document.getElementById('special-products-scroll')?.scrollBy({ left: 300, behavior: 'smooth' });
            }}
            aria-label="Прокрутить вправо"
            type="button"
          >
            <svg width="24" height="24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
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