// app/components/AuthorDecorBlock.tsx

"use client";

import Image from "next/image";
import Link from "next/link";

export default function AuthorDecorBlock() {
  return (
    <section className="bg-[#f8f6f2] font-serif text-[#1d1d1b]">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Левая часть */}
        <div className="flex flex-col justify-center p-8 md:p-16">
          <h1 className="text-3xl md:text-5xl font-medium tracking-wide mb-16 uppercase">
            Интерьер, который говорит с вами
          </h1>

          <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
            Интерьер формирует наше настроение и ощущение уюта.
            Правильно подобранный авторский декор делает пространство
            живым, гармоничным и неповторимым. Каждый предмет —
            будь то светильник, рамка или шкатулка —
            способен подчеркнуть индивидуальность и наполнить дом вдохновением.
          </p>

          <Link
            href="/blog"
            className="inline-block bg-[#2e3526] text-white px-8 py-3 rounded-full text-sm tracking-wide mb-4 hover:bg-[#404a38] transition"
          >
            ПОДРОБНЕЕ В НАШЕМ БЛОГЕ
          </Link>
        </div>

        {/* Правая часть */}
        <div className="flex flex-col">
          {/* Верхнее изображение — увеличено */}
          <div className="relative w-full h-72 md:h-96">
            <Image
              src="/uploads/blog-dishes.jpg"
              alt="Декоративная посуда"
              fill
              className="object-cover"
            />
          </div>

          {/* Блок с текстом на тёмном фоне */}
          <div className="bg-[#2e3526] text-white p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl font-medium mb-4">
              «Декоративная посуда:<br />modern classic»
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-6">
              Коллекция дизайнерской посуды объединяет эстетику классики
              и современного минимализма. Каждая тарелка и чаша — это
              произведение искусства, которое превращает сервировку
              в настоящую атмосферу стиля и уюта.
            </p>
            <Link
              href="/category/posuda"
              className="text-white underline underline-offset-4 hover:text-gray-300 transition"
            >
              подробнее →
            </Link>
          </div>
        </div>
      </div>

      {/* Нижний блок с 3 изображениями */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 p-4 md:p-8">
        <div className="relative w-full h-48 md:h-64">
          <Image
            src="/uploads/blog-left1.jpg"
            alt="Декор 1"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative w-full h-48 md:h-64">
          <Image
            src="/uploads/blog-left2.jpg"
            alt="Декор 2"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative w-full h-48 md:h-64">
          <Image
            src="/uploads/blog-left3.jpg"
            alt="Декор 3"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
