'use client';

import { FaInstagram } from 'react-icons/fa';
import Image from 'next/image';

interface InstagramCardProps {
  src: string;
  alt: string;
}

function InstagramCard({ src, alt }: InstagramCardProps) {
  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/provance33/', '_blank');
  };

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
      onClick={handleInstagramClick}
    >
      {/* Изображение */}
      <div className="relative aspect-square overflow-hidden rounded-2xl">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          unoptimized={true}
        />
        
        {/* Оверлей при наведении */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <FaInstagram className="text-white text-4xl drop-shadow-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InstagramSection() {
  // Правильные пути к изображениям Instagram — соответствуют файлам в public/инста
  const instagramImages = [
    '/instagram/IMG_1.png',
    '/instagram/IMG_2.png',
    '/instagram/IMG_3.png',
    '/instagram/IMG_4.png',
    '/instagram/IMG_5.png',
    '/instagram/IMG_6.png',
    '/instagram/IMG_7.png',
    '/instagram/IMG_8.png',
  ];

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/provance33/', '_blank');
  };

  return (
    <section className="container mx-auto px-4 py-12 bg-gradient-to-r ">
      {/* Заголовок секции */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Следите за нами в Instagram
        </h2>
        <p className="text-gray-600 text-lg mb-8">
          Вдохновляйтесь идеями декора и следите за новинками
        </p>
        <button 
          onClick={handleInstagramClick}
          className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <FaInstagram className="text-2xl" />
          @provance33
        </button>
      </div>

      {/* Сетка изображений */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {instagramImages.map((image, index) => (
          <InstagramCard
            key={index}
            src={image}
            alt={`Instagram фото ${index + 1}`}
          />
        ))}
      </div>

      {/* Дополнительная информация */}
      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm">
          Нажмите на любое фото, чтобы перейти в наш Instagram
        </p>
      </div>
    </section>
  );
}