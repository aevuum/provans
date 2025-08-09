'use client';

import React, { useState, useCallback, useMemo, lazy, Suspense, useEffect } from 'react';
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
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { toggleSearch } from '../../lib/features/ui/uiSlice';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getProductImage } from '../../types';

// Lazy load компонентов
const AuthModal = lazy(() => import("./AuthModal"));

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
  const dispatch = useAppDispatch();
  const router = useRouter();
  // Добавляем флаг монтирования клиента, чтобы избежать SSR/CSR рассинхронизации
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  // Используем селекторы с мемоизацией
  const cart = useAppSelector((state) => state.cart.items);
  const favorites = useAppSelector((state) => state.favorites.items);
  const showSearch = useAppSelector((state) => state.ui.showSearch);

  // Мемоизируем вычисления
  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * (item.count || 1)), 0), 
    [cart]
  );

  // Оптимизированные обработчики
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

  // Обработчик поиска
  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/catalog/все-категории?search=${encodeURIComponent(query.trim())}`);
      dispatch(toggleSearch());
    }
  };

  const handleMobileSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = (formData.get('mobileSearch') as string) || '';
    handleSearch(query);
  };

  const onUserIconClick = () => {
    if (session) {
      router.push('/profile');
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
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
          </div>
          {/* Краткий телефон рядом с логотипом на маленьких экранах */}
          <a
            href="tel:88007771872"
            className="md:hidden inline-flex items-center gap-2 text-gray-600 text-sm"
          >
            <FaPhone className="text-gray-500 text-sm" />
            <span>8 (800) 777-18-72</span>
          </a>

          {/* Desktop Contact */}
          <div className="hidden lg:flex flex-col ml-8">
            <div className="flex items-center gap-2">
              <FaPhone className="text-gray-500 text-sm" />
              <a
                href="tel:88007771872"
                className="font-medium text-gray-500 text-sm hover:text-[#7C5C27] transition-colors"
              >
                8 (800) 777-18-72
              </a>
            </div>
            <p className="text-gray-400 text-xs mt-1 ml-5">с 09:00 до 21:00</p>
          </div>

          {/* Icons */}
          <div className="flex items-center justify-between gap-7 max-w-[180px] sm:max-w-[200px]">
            {/* Search icon (на всех разрешениях) */}
            <button
              className="text-gray-600 hover:text-[#7C5C27] transition-colors"
              onClick={() => dispatch(toggleSearch())}
              aria-label="Поиск"
            >
              <FaSearch className="w-5 h-5 cursor-pointer" />
            </button>
            {/* Heart */}
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
            {/* User */}
            <div className="relative group">
              <button
                className="text-gray-600 hover:text-[#7C5C27] transition-colors"
                onClick={onUserIconClick}
                aria-label="Профиль"
              >
                <FaUser className="w-6 h-6 cursor-pointer" />
              </button>
              {/* Убрано ховер-меню пользователя */}
            </div>
            {/* Cart Popover */}
            <div
              className="relative"
              onMouseEnter={() => setCartPopoverOpen(true)}
              onMouseLeave={() => setCartPopoverOpen(false)}
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
                <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg z-50 p-4 min-w-[320px]">
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
            <li className="group relative list-none">
              <button
                type="button"
                className="flex items-center gap-1 rounded-md px-4 py-2 text-gray-800 transition-colors hover:bg-white/10"
              >
                Каталог
                <FaChevronDown className="ml-1 h-3 w-3 transition-transform group-hover:rotate-180 cursor-pointer" />
              </button>
              <div className="invisible absolute left-0 top-full z-50 mt-1 w-56 rounded-md bg-white py-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                {[
                  { name: 'Все категории', href: '/catalog/все-категории' },
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
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </li>
            {[
              { name: 'Акции', href: '/catalog/акции' },
              { name: 'Новинки', href: '/catalog/новинки' },
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
                    { name: 'Все категории', href: '/catalog/все-категории' },
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
                { name: 'Акции', href: '/catalog/акции' },
                { name: 'Новинки', href: '/catalog/новинки' },
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

      {/* Модальное окно авторизации */}
      <Suspense fallback={<div className="hidden">Loading...</div>}>
        <AuthModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      </Suspense>

      {/* Модальное окно поиска для мобильных и десктопа */}
      {mounted && showSearch && (
        <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Поиск товаров</h3>
              <button
                onClick={() => dispatch(toggleSearch())}
                className="text-gray-600 hover:text-gray-800"
                aria-label="Закрыть поиск"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleMobileSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  name="mobileSearch"
                  placeholder="Поиск товаров..."
                  className="w-full py-3 px-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] text-base"
                  autoComplete="off"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C5C27] w-6 h-6"
                  aria-label="Поиск"
                >
                  <FaSearch />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
});

Header.displayName = 'Header';

export default Header;