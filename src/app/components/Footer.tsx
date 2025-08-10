//app/components/Footer.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaVk, FaTelegram, FaInstagram } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 text-sm mt-8 border-t border-gray-200">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Логотип и описание */}
          <div  >
            <Link href="/" className="block relative h-12 w-32 mb-4">
              <Image
                src="/icons/provans-b2.png"
                alt="Прованс Декор"
                fill
                className="object-contain"
                sizes="128px"
              />
            </Link>
            <p className="text-base text-gray-600">
              Преврати дом в уютное произведение искусства — с нашим декором ты создашь атмосферу, вдохновляющую каждый день.
            </p>
          </div>

          {/* Навигация */}
          <div  className="lg:ml-16">
            <h4 className="font-semibold  mb-3 text-gray-800">Навигация</h4>
            <ul className="space-y-2">
              <li><Link href="/catalog/all" className="hover:text-[#7C5C27] hover:bg-[#E5D3B3] px-1 rounded">Каталог</Link></li>
              <li><Link href="/discount" className="hover:text-[#7C5C27] hover:bg-[#E5D3B3] px-1 rounded">Акции</Link></li>
              <li><Link href="/catalog/new" className="hover:text-[#7C5C27] hover:bg-[#E5D3B3] px-1 rounded">Новинки</Link></li>
              <li><Link href="/about" className="hover:text-[#7C5C27] hover:bg-[#E5D3B3] px-1 rounded">О компании</Link></li>
              <li><Link href="/contacts" className="hover:text-[#7C5C27] hover:bg-[#E5D3B3] px-1 rounded">Контакты</Link></li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-800">Контакты</h4>
            <ul className="space-y-2">
              <li>
                <a href="tel:88007771872" className="hover:text-[#7C5C27] hover:bg-[#E5D3B3] px-1 rounded">
                  8 (800) 777-18-72
                </a>
              </li>
              <li>
                <a href="mailto:info@provans.ru" className="hover:text-[#7C5C27] hover:bg-[#E5D3B3] px-1 rounded">
                  info@provans.ru
                </a>
              </li>
              <li>
                <p className="text-gray-500">Ежедневно с 9:00 до 21:00</p>
              </li>
            </ul>
          </div>

          {/* Соцсети и платежи */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-800">Мы в соцсетях</h4>
            <div className="flex gap-5 mb-4">
              <a href="https://vk.com" target="_blank" rel="noopener noreferrer" aria-label="ВКонтакте" className="text-gray-400 hover:text-[#7C5C27]">
                <FaVk size={24} />
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="text-gray-400 hover:text-[#7C5C27]">
                <FaTelegram size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-[#7C5C27]">
                <FaInstagram size={24} />
              </a>
            </div>

            <h4 className="font-semibold  text-gray-800">Платёжные системы</h4>
            <div className="flex  gap-2 items-start">
             <div className="relative h-12 w-10">
    <Image
      src="/icons/visa_card2.png"
      alt="Visa"
      fill
      sizes="48px"
    />
  </div>

  {/* Mastercard */}
  <div className="relative h-12 w-10">
    <Image
      src="/icons/mastercard.png"
      alt="Mastercard"
      fill
      sizes="48px"
    />
  </div>

  {/* Mir */}
  <div className="relative h-12 w-10">
    <Image
      src="/icons/mir_card2.png"
      alt="Мир"
      fill
      sizes="48px"
    />
  </div>
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="mt-10 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Provans Decor. Все права защищены.
        </div>
      </div>
    </footer>
  );
};
