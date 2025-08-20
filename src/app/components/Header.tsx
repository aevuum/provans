'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaSearch,
  FaHeart,
  FaUser,
  FaShoppingBag,
  FaPhone,
  FaChevronDown,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../../lib/hooks';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getProductImage } from '../../types';
import AuthModal from './AuthModal';
import { SearchBar } from './SearchBar';
import { toggleSearch } from '../../lib/features/ui/uiSlice';

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface ExtendedSession {
  user?: ExtendedUser;
  expires: string;
}

export const Header = React.memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartPopoverOpen, setCartPopoverOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const router = useRouter();
  const dispatch = useAppDispatch();
  const showSearch = useAppSelector((state) => state.ui.showSearch);
  // Добавляем флаг монтирования клиента, чтобы избежать SSR/CSR рассинхронизации
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Используем селекторы с мемоизацией
  const cart = useAppSelector((state) => state.cart.items);
  const favorites = useAppSelector((state) => state.favorites.items);

  // Мемоизируем вычисления
  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * (item.count || 1)), 0), 
    [cart]
  );

  // Оптимизированные обработчики
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

  const onUserIconClick = () => {
    if (session) {
      router.push('/profile');
    } else {
      setLoginModalOpen(true);
    }
  };

  const closeCartWithDelay = useCallback(() => {
    // увеличенная задержка закрытия поповера корзины
    setTimeout(() => setCartPopoverOpen(false), 2000);
  }, []);

  // Задержки для дропдаунов (каталог/профиль)
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const hoverTimers = useRef<{ catalog?: ReturnType<typeof setTimeout>; profile?: ReturnType<typeof setTimeout> }>({});
  const openWithDelay = (key: 'catalog' | 'profile') => {
    if (hoverTimers.current[key]) clearTimeout(hoverTimers.current[key]);
    hoverTimers.current[key] = setTimeout(() => {
      if (key === 'catalog') setCatalogOpen(true);
      else setProfileOpen(true);
    }, 120);
  };
  const closeWithDelay = (key: 'catalog' | 'profile') => {
    if (hoverTimers.current[key]) clearTimeout(hoverTimers.current[key]);
    hoverTimers.current[key] = setTimeout(() => {
      if (key === 'catalog') setCatalogOpen(false);
      else setProfileOpen(false);
    }, 2000);
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      {/* Мобильное модальное окно поиска */}
      {showSearch && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-start justify-center pt-24 px-2">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-4 relative">
            <SearchBar isMobile />
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => dispatch(toggleSearch(false))}
              aria-label="Закрыть поиск"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
      {/* Top Bar */}
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Burger + Adaptive Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMenu}
              className="text-gray-600 lg:hidden"
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {isMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>

            <Link
              href="/"
              className="relative h-12 w-20 sm:w-24 md:w-28 lg:w-[88px] xl:w-[96px] 2xl:w-32 transition-all duration-300 flex-shrink-0 cursor-pointer ml-0 lg:ml-6"
            >
              <Image
                src="/icons/provans-b2.png"
                alt="Логотип"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, (max-width: 1400px) 120px, 128px"
              />
            </Link>

            {/* Desktop Contact рядом с логотипом */}
            <div className="hidden lg:flex flex-col ml-4">
              <div className="flex items-center gap-2">
                <FaPhone className="text-gray-500 text-sm" />
                <a
                  href="tel:88007771872"
                  className="font-medium text-gray-500 text-sm hover:text-[#7C5C27] transition-colors"
                >
                  <span className="tabular-nums">8 (800) 777-18-72</span>
                </a>
              </div>
              <p className="text-gray-400 text-xs mt-1 ml-5">с 09:00 до 21:00</p>
            </div>
          </div>

          {/* Правый блок: поиск + иконки в одной линии с равными отступами */}
          <div className="flex items-center justify-end gap-6 flex-1">
            {/* Десктопный поиск */}
            <div className="hidden lg:block w-full max-w-xl">
              <SearchBar placeholder="Поиск товаров..." />
            </div>

            {/* Иконка поиска (только мобильный) */}
            <button
              className="text-gray-600 hover:text-[#7C5C27] transition-colors lg:hidden"
              onClick={() => dispatch(toggleSearch(true))}
              aria-label="Поиск"
            >
              <FaSearch className="w-5 h-5 cursor-pointer" />
            </button>

            {/* Избранное */}
            <button
              className="relative text-gray-600 hover:text-[#7C5C27] transition-colors"
              onClick={() => router.push('/favorites')}
              aria-label="Избранное"
            >
              <FaHeart className="w-6 h-6 cursor-pointer" />
              {mounted && favorites.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#E5D3B3] text-[#7C5C27] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Профиль */}
            <div
              className="relative"
              onMouseEnter={() => openWithDelay('profile')}
              onMouseLeave={() => closeWithDelay('profile')}
            >
              <button
                className="text-gray-600 hover:text-[#7C5C27] transition-colors"
                onClick={onUserIconClick}
                aria-label="Профиль"
              >
                <FaUser className="w-6 h-6 cursor-pointer" />
              </button>
              {/* Ховер-меню профиля (десктоп) */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <nav className="py-2">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Профиль</Link>
                    <Link href="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Избранное</Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Заказы</Link>
                  </nav>
                </div>
              )}
            </div>

            {/* Корзина */}
            <div
              className="relative"
              onMouseEnter={() => setCartPopoverOpen(true)}
              onMouseLeave={closeCartWithDelay}
            >
              <button
                className="relative text-gray-600 hover:text-[#7C5C27] transition-colors"
                aria-label="Корзина"
                tabIndex={0}
                onClick={() => router.push('/cart')}
              >
                <FaShoppingBag className="w-6 h-6 cursor-pointer" />
                {mounted && cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#E5D3B3] text-[#7C5C27] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              {/* Popover */}
              {cartPopoverOpen && (
                <div
                  className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg z-50 p-4 min-w-[320px]"
                  onMouseEnter={() => setCartPopoverOpen(true)}
                  onMouseLeave={closeCartWithDelay}
                >
                  <h3 className="font-bold mb-2 text-lg">Корзина</h3>
                  {cart.length === 0 ? (
                    <div className="text-gray-400 text-sm">Корзина пуста</div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cart.slice(0, 3).map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="relative w-14 h-14">
                            <Image
                              src={getProductImage(item)}
                              alt={item.title}
                              fill
                              className="object-contain rounded"
                              sizes="56px"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm truncate">{item.title}</div>
                            <div className="text-xs text-gray-500">{item.price.toLocaleString('ru-RU')} ₽</div>
                          </div>
                          <div className="text-xs text-gray-500">{item.count || 1} шт</div>
                        </div>
                      ))}
                      {cart.length > 3 && (
                        <div className="text-xs text-gray-400">+ ещё {cart.length - 3} товаров</div>
                      )}
                    </div>
                  )}
                  <div className="mt-4">
                    <div className="flex justify-between font-semibold mb-2">
                      <span>Итого:</span>
                      <span>{cartTotal.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <button
                      className="w-full bg-[#E5D3B3] text-[#7C5C27] py-2 rounded hover:bg-[#d6c2a3] transition font-semibold"
                      onClick={() => router.push('/cart')}
                    >
                      Перейти в корзину
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block border-t border-gray-100">
        <div className="container mx-auto px-4 py-2">
          <nav className="flex items-center justify-center gap-8">
            <li
              className="relative list-none"
              onMouseEnter={() => openWithDelay('catalog')}
              onMouseLeave={() => closeWithDelay('catalog')}
            >
              <button
                type="button"
                className="flex items-center gap-1 rounded-md px-4 py-2 text-gray-800 transition-colors hover:bg-white/10"
                onClick={() => setCatalogOpen(v => !v)}
              >
                Каталог
                <FaChevronDown className={`ml-1 h-3 w-3 transition-transform ${catalogOpen ? 'rotate-180' : ''} cursor-pointer`} />
              </button>
              <div
                className={`absolute left-0 top-full z-50 mt-1 w-56 rounded-md bg-white py-2 shadow-lg transition-opacity duration-150 ${catalogOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onMouseEnter={() => openWithDelay('catalog')}
                onMouseLeave={() => closeWithDelay('catalog')}
              >
                {[
                  { name: 'Все категории', href: '/catalog/all' },
                  { name: 'Вазы', href: '/catalog/vases' },
                  { name: 'Подсвечники', href: '/catalog/candlesticks' },
                  { name: 'Рамки', href: '/catalog/frames' },
                  { name: 'Цветы', href: '/catalog/flowers' },
                  { name: 'Шкатулки', href: '/catalog/jewelry-boxes' },
                  { name: 'Фигурки', href: '/catalog/figurines' },
                  { name: 'Книгодержатели', href: '/catalog/bookends' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-gray-700 hover:bg-[#E5D3B3] hover:text-[#7C5C27]"
                    onClick={() => setCatalogOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </li>
            {[
              { name: 'Акции', href: '/discount' },
              { name: 'Новинки', href: '/catalog/new' },
              { name: 'О компании', href: '/about' },
              { name: 'Контакты', href: '/contacts' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-[#7C5C27] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-40 pt-20 px-6 overflow-y-auto">
          <button
            onClick={toggleMenu}
            className="absolute top-4 right-4 text-gray-600 z-50"
            aria-label="Закрыть меню"
          >
            <FaTimes className="w-6 h-6" />
          </button>

          <div className="container mx-auto">
            <nav className="flex flex-col gap-1 py-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Каталог</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Все категории', href: '/catalog/all' },
                    { name: 'Вазы', href: '/catalog/vases' },
                    { name: 'Подсвечники', href: '/catalog/candlesticks' },
                    { name: 'Рамки', href: '/catalog/frames' },
                    { name: 'Цветы', href: '/catalog/flowers' },
                    { name: 'Шкатулки', href: '/catalog/jewelry-boxes' },
                    { name: 'Фигурки', href: '/catalog/figurines' },
                    { name: 'Книгодержатели', href: '/catalog/bookends' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-gray-700 py-2 px-3 rounded hover:bg-[#E5D3B3] hover:text-[#7C5C27]"
                      onClick={toggleMenu}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {[
                { name: 'Акции', href: '/discount' },
                { name: 'Новинки', href: '/catalog/new' },
                { name: 'О компании', href: '/about' },
                { name: 'Контакты', href: '/contacts' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 py-3 text-lg border-t border-gray-100"
                  onClick={toggleMenu}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Модалка логина */}
      {loginModalOpen && (
        <AuthModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      )}
    </header>
  );
});

Header.displayName = 'Header';

export default Header;