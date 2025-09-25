"use client";

import Link from "next/link";
import { SafeImage } from '@/components/SafeImage';

type Card = {
  title: string;
  href: string;
  image: string;
};

const cards: Card[] = [
  {
    title: "Цветочные композиции",
    href: "/catalog/flowers?subcategory=arrangements",
  image: "/section-int/section-int-flowers.jpg", // updated to use public/section-int
  },
  {
    title: "Ароматы для дома",
    href: "/catalog/home-fragrances",
  image: "/section-int/section-int-arome.JPG",
  },
  {
    title: "Скатерти",
    href: "/catalog/textiles?subcategory=tablecloths",
  image: "/section-int/section-int-scat.jpg", // updated to use public/section-int
  },
];

export default function SectionFoundForYou() {
  return (
    <section className="container mx-auto px-4 pt-8 md:pt-12 pb-16 md:pb-24">
      <h2 className="text-3xl md:text-4xl tracking-wider text-center mb-8 text-gray-800 section-heading">
        Нашли что-то интересное для вас
      </h2>

      <div className="w-full overflow-x-auto no-scrollbar py-2 whitespace-nowrap md:overflow-visible md:flex md:flex-wrap md:gap-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={`group relative block md:flex-1 md:min-w-0 overflow-hidden rounded-0 md:rounded-2xl bg-[#f5f1e9] shadow-sm hover:shadow-md transition-shadow p-0 h-64 sm:h-72 md:h-[420px] lg:h-[480px]`}
          >
            <div className="relative w-full h-full">
              <SafeImage
                src={card.image}
                alt={card.title}
                fill
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="inline-block bg-white/80 text-gray-900 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                  <span className="text-sm md:text-base font-semibold">{card.title}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        <style>{` .no-scrollbar::-webkit-scrollbar{display:none} .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;} `}</style>
      </div>
    </section>
  );
}
