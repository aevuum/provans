'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaVk, FaTelegram, FaInstagram, FaMapMarkerAlt } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="bg-[#2e3526] text-white mt-8 border-t border-gray-200">
      <div className="container mx-auto px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          {/* Логотип и описание */}
          <div className="flex flex-col items-start">
         <div className="relative mb-8 w-[140px] h-[60px]">
  <Image
    src="/icons/provans-white5.png"
    alt="Прованс Декор"
    fill
    className="object-contain"
    priority
    sizes="120px"
  />
</div>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed font-light">
              Преврати дом в уютное произведение искусства — с нашим декором ты создашь атмосферу, вдохновляющую каждый день.
            </p>
          </div>

          {/* Навигация */}
          <div className="lg:ml-10">
            <h4
              className="mb-4 uppercase text-2xl md:text-3xl tracking-widest font-normal whitespace-nowrap"
              style={{
                color: 'var(--color-primary-400)',
                fontFamily: 'var(--footer-heading)',
              }}
            >
              НАВИГАЦИЯ
            </h4>
            <ul className="space-y-3 text-xl md:text-2xl font-sans">
              <li>
                <Link href="/catalog/all" className="hover:text-[var(--color-primary-200)] transition-colors duration-200">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/discount" className="hover:text-[var(--color-primary-200)] transition-colors duration-200">
                  Акции
                </Link>
              </li>
              <li>
                <Link href="/catalog/new" className="hover:text-[var(--color-primary-200)] transition-colors duration-200">
                  Новинки
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--color-primary-200)] transition-colors duration-200">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="hover:text-[var(--color-primary-200)] transition-colors duration-200">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4
              className="mb-4 uppercase text-2xl md:text-3xl tracking-widest font-normal whitespace-nowrap"
              style={{
                color: 'var(--color-primary-400)',
                fontFamily: 'var(--footer-heading)',
              }}
            >
              КОНТАКТЫ
            </h4>
            <ul className="space-y-3 text-xl md:text-2xl font-sans">
              <li>
                <a href="tel:88007771872" className="hover:text-[var(--color-primary-200)] transition-colors duration-200">
                  8 (800) 777-18-72
                </a>
              </li>
              <li>
                <a href="mailto:info@provans.ru" className="hover:text-[var(--color-primary-200)] transition-colors duration-200">
                  info@provans.ru
                </a>
              </li>
              <li>
                <span className="text-white/60 text-lg md:text-xl">Ежедневно с 9:00 до 21:00</span>
              </li>
            </ul>
          </div>

          {/* Адрес и соцсети */}
          <div className="flex flex-col h-full justify-between ">
            <div>
              <div className="flex items-center gap-4 text-xl md:text-2xl text-white/90 mb-8">
                <FaMapMarkerAlt className="text-[var(--color-primary-400)]" size={32} />
                <span>
                  Владимир, ул.Примерная 1
                </span>
              </div>
              <div className="flex gap-4">
                <Link
                  href="https://vk.com/provance_33"
                  target="_blank"
                  aria-label="ВКонтакте"
                  className="rounded-full bg-[var(--color-primary-400)] w-10 h-10 flex items-center justify-center transition-colors duration-200 hover:bg-white group"
                >
                  <FaVk
                    size={20}
                    className="text-white group-hover:text-[#4A76A8] transition-all duration-200"
                  />
                </Link>
                <Link
                  href="https://t.me/provancebutik"
                  target="_blank"
                  aria-label="Telegram"
                  className="rounded-full bg-[var(--color-primary-400)] w-10 h-10 flex items-center justify-center transition-colors duration-200 hover:bg-white group"
                >
                  <FaTelegram
                    size={20}
                    className="text-white group-hover:text-[#229ED9] transition-all duration-200"
                  />
                </Link>
                <Link
                  href="https://www.instagram.com/provance33/"
                  target="_blank"
                  aria-label="Instagram"
                  className="rounded-full bg-[var(--color-primary-400)] w-10 h-10 flex items-center justify-center transition-colors duration-200 hover:bg-white group"
                >
                  <FaInstagram
                    size={20}
                    className="text-white group-hover:text-[#E1306C] transition-all duration-200"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="mt-12 border-t border-white/20 pt-6 text-center text-lg md:text-xl text-white/60 font-light">
          © {new Date().getFullYear()} Provans Decor. Все права защищены.
        </div>
      </div>
    </footer>
  );
};