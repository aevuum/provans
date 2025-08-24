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
import { useRouter, usePathname } from 'next/navigation';
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

interface Subcategory {
  name: string;
  href: string;
}

interface Category {
  name: string;
  href: string;
  subcategories?: Subcategory[];
}

export const Header = React.memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartPopoverOpen, setCartPopoverOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const router = useRouter();
  const dispatch = useAppDispatch();
  const showSearch = useAppSelector((state) => state.ui.showSearch);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Определяем, находимся ли мы на главной странице
  const isHome = pathname === '/';

  // Состояние скролла только для главной
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const cart = useAppSelector((state) => state.cart.items);
  const favorites = useAppSelector((state) => state.favorites.items);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price * (item.count || 1)), 0),
    [cart]
  );

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  const onUserIconClick = () => {
    if (session) router.push('/profile');
    else setLoginModalOpen(true);
  };

  const closeCartWithDelay = useCallback(() => {
    setTimeout(() => setCartPopoverOpen(false), 2000);
  }, []);

  // Каталог
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCategoryRef, setActiveCategoryRef] = useState<HTMLDivElement | null>(null);
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
      if (key === 'catalog') {
        setCatalogOpen(false);
        setActiveCategory(null);
        setActiveCategoryRef(null);
      } else setProfileOpen(false);
    }, 200);
  };

  const catalogStructure: Category[] = [
    {
      name: 'Декор',
      href: '/catalog/decor',
      subcategories: [
        { name: 'Фоторамки', href: '/catalog/decor?subcategory=frames' },
        { name: 'Вазы', href: '/catalog/decor?subcategory=vases' },
        { name: 'Зеркала', href: '/catalog/decor?subcategory=mirrors' },
        { name: 'Подсвечники', href: '/catalog/decor?subcategory=candlesticks' },
        { name: 'Шкатулки', href: '/catalog/decor?subcategory=jewelry-boxes' },
        { name: 'Интерьерные фигуры', href: '/catalog/decor?subcategory=figurines' },
        { name: 'Часы', href: '/catalog/decor?subcategory=clocks' },
        { name: 'Садовый декор и фигуры', href: '/catalog/decor?subcategory=garden' },
      ]
    },
    {
      name: 'Искусственные цветы',
      href: '/catalog/artificial-flowers',
      subcategories: [
        { name: 'Искусственные цветы', href: '/catalog/artificial-flowers' },
        { name: 'Интерьерные композиции', href: '/catalog/artificial-flowers?subcategory=arrangements' },
      ]
    },
    {
      name: 'Текстиль',
      href: '/catalog/textiles',
      subcategories: [
        { name: 'Покрывала и пледы', href: '/catalog/textiles?subcategory=blankets' },
        { name: 'Скатерти и салфетки', href: '/catalog/textiles?subcategory=tablecloths' },
        { name: 'Косметички', href: '/catalog/textiles?subcategory=cosmetic-bags' },
        { name: 'Подушки и наволочки', href: '/catalog/textiles?subcategory=pilows' },
        { name: 'Полотенца', href: '/catalog/textiles?subcategory=towels' },
      ]
    },
    {
      name: 'Посуда и бокалы',
      href: '/catalog/tableware',
      subcategories: [
        { name: 'Посуда и сервизы', href: '/catalog/tableware?subcategory=dishes' },
        { name: 'Столовые приборы', href: '/catalog/tableware?subcategory=cutlery' },
        { name: 'Бокалы для напитков', href: '/catalog/tableware?subcategory=glasses' },
        { name: 'Предметы для сервировки', href: '/catalog/tableware?subcategory=serving' },
      ]
    },
    {
      name: 'Мебель',
      href: '/catalog/furniture',
      subcategories: []
    },
    {
      name: 'Ароматы для дома',
      href: '/catalog/home-fragrances',
      subcategories: [
        { name: 'Диффузоры', href: '/catalog/home-fragrances?subcategory=diffusers' },
        { name: 'Ароматные букеты', href: '/catalog/home-fragrances?subcategory=bouquets' },
        { name: 'Ароматные свечи', href: '/catalog/home-fragrances?subcategory=candles' },
        { name: 'Спреи для дома', href: '/catalog/home-fragrances?subcategory=sprays' },
      ]
    },
    {
      name: 'Пасхальная коллекция',
      href: '/catalog/easter-collection',
      subcategories: []
    },
    {
      name: 'Новый год',
      href: '/catalog/new-year',
      subcategories: [
        { name: 'Фигуры и статуэтки', href: '/catalog/new-year?subcategory=figures' },
        { name: 'Ветки и композиции', href: '/catalog/new-year?subcategory=branches' },
        { name: 'Елочные игрушки', href: '/catalog/new-year?subcategory=toys' },
        { name: 'Елочные шары', href: '/catalog/new-year?subcategory=balls' },
        { name: 'Елки', href: '/catalog/new-year?subcategory=trees' },
        { name: 'Гирлянды', href: '/catalog/new-year?subcategory=garlands' },
      ]
    }
  ];

  // Определяем стили для хедера и элементов в зависимости от страницы и скролла
  const headerBg = isHome && !isScrolled ? 'bg-transparent' : 'bg-white shadow-sm';
  const textColor = isHome && !isScrolled ? 'text-white' : 'text-gray-800';
  const iconColor = isHome && !isScrolled ? 'text-white' : 'text-gray-600';
  
  // Определяем путь к логотипу
  const logoSrc = isHome && !isScrolled 
    ? '/icons/provans-white5.png' // Белый логотип только на главной без скролла
    : '/icons/provans-b2.png'; // Черный логотип по умолчанию

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${headerBg}`}>
      {/* Мобильный поиск */}
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
          {/* Burger + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMenu}
              className={`lg:hidden ${iconColor}`}
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
            <Link
              href="/"
              className="relative h-12 w-20 sm:w-24 md:w-28 lg:w-[88px] xl:w-[96px] 2xl:w-32 transition-all duration-300 flex-shrink-0 cursor-pointer ml-0 lg:ml-6"
            >
              <Image
                src={logoSrc}
                alt="Логотип"
                fill
                className={`object-contain ${isHome && !isScrolled ? 'scale-100' : ''}`}
                priority
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, (max-width: 1400px) 120px, 128px"
              />
            </Link>
            {/* Контакты */}
            <div className="hidden lg:flex flex-col ml-4">
              <div className="flex items-center gap-2">
                <FaPhone className={`text-sm ${textColor}`} />
                <a
                  href="tel:88007771872"
                  className={`font-medium text-sm transition-colors ${textColor} hover:text-[#7C5C27]`}
                >
                  <span className="tabular-nums">8 (800) 777-18-72</span>
                </a>
              </div>
              <p className={`text-xs mt-1 ml-5 ${isHome && !isScrolled ? 'text-white/70' : 'text-gray-400'}`}>
                с 09:00 до 21:00
              </p>
            </div>
          </div>
          {/* Icons */}
          <div className="flex items-center justify-end gap-6 flex-1">
            <div className="hidden lg:block w-full max-w-xl">
              <SearchBar placeholder="Поиск товаров..." />
            </div>
            <button
              className={`transition-colors lg:hidden ${iconColor} hover:text-[#7C5C27]`}
              onClick={() => dispatch(toggleSearch(true))}
              aria-label="Поиск"
            >
              <FaSearch className="w-5 h-5 cursor-pointer" />
            </button>
            <button
              className={`relative transition-colors ${iconColor} hover:text-[#7C5C27]`}
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
            <div
              className="relative"
              onMouseEnter={() => openWithDelay('profile')}
              onMouseLeave={() => closeWithDelay('profile')}
            >
              <button
                className={`transition-colors ${iconColor} hover:text-[#7C5C27]`}
                onClick={onUserIconClick}
                aria-label="Профиль"
              >
                <FaUser className="w-6 h-6 cursor-pointer" />
              </button>
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
            <div
              className="relative"
              onMouseEnter={() => setCartPopoverOpen(true)}
              onMouseLeave={closeCartWithDelay}
            >
              <button
                className={`relative transition-colors ${iconColor} hover:text-[#7C5C27]`}
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
      <div className={`hidden lg:block border-t transition-all duration-300 ${isHome && !isScrolled ? 'border-white/20' : 'border-gray-100'}`}>
        <div className="container mx-auto px-4 py-2">
          <nav className="flex items-center justify-center gap-8">
            <li
              className="relative list-none"
              onMouseEnter={() => openWithDelay('catalog')}
              onMouseLeave={() => closeWithDelay('catalog')}
            >
              <button
                type="button"
                className={`flex items-center gap-1 rounded-md px-4 py-2 transition-colors ${textColor} ${isHome && !isScrolled ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
                onClick={() => setCatalogOpen(v => !v)}
              >
                Каталог
                <FaChevronDown className={`ml-1 h-3 w-3 transition-transform ${catalogOpen ? 'rotate-180' : ''} cursor-pointer ${isHome && !isScrolled ? 'text-white' : 'text-gray-600'}`} />
              </button>
              
              {/* Выпадающее меню каталога */}
              {catalogOpen && (
                <div
                  className="absolute left-0 top-full z-50 bg-white rounded-md shadow-lg py-2" // Убрал mt-2 чтобы подкатегории были ближе
                  style={{ width: '340px' }}
                  onMouseEnter={() => {
                    if (hoverTimers.current.catalog) {
                      clearTimeout(hoverTimers.current.catalog);
                    }
                  }}
                  onMouseLeave={() => closeWithDelay('catalog')}
                >
                  <div className="relative">
                    {/* Основные категории */}
                    <div>
                      {catalogStructure.map((category) => (
                        <div
                          key={category.href}
                          ref={(el) => {
                            if (activeCategory === category.name && el) {
                              setActiveCategoryRef(el);
                            }
                          }}
                          className="relative group"
                          onMouseEnter={() => {
                            if (hoverTimers.current.catalog) {
                              clearTimeout(hoverTimers.current.catalog);
                            }
                            setActiveCategory(category.name);
                          }}
                          onMouseLeave={() => {
                            // Не очищаем активную категорию сразу
                          }}
                        >
                          <Link
                            href={category.href}
                            className={`block px-4 py-2 transition-colors rounded ${activeCategory === category.name ? 'bg-[#E5D3B3] text-[#7C5C27]' : 'text-gray-800 hover:bg-[#E5D3B3] hover:text-[#7C5C27]'}`}
                            onClick={() => setCatalogOpen(false)}
                          >
                            {category.name}
                          </Link>
                        </div>
                      ))}
                    </div>

                    {/* Подкатегории - показываются справа от активной категории */}
                    {activeCategory && activeCategoryRef && (() => {
                      const activeCat = catalogStructure.find(cat => cat.name === activeCategory);
                      return activeCat?.subcategories && activeCat.subcategories.length > 0;
                    })() && (
                      <div 
                        className="absolute left-full top-0 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50 min-w-[200px]"
                        style={{
                          top: activeCategoryRef.offsetTop,
                        }}
                        onMouseEnter={() => {
                          if (hoverTimers.current.catalog) {
                            clearTimeout(hoverTimers.current.catalog);
                          }
                        }}
                        onMouseLeave={() => closeWithDelay('catalog')}
                      >
                        {catalogStructure
                          .find(cat => cat.name === activeCategory)
                          ?.subcategories?.map((subcategory) => (
                            <Link
                              key={subcategory.href}
                              href={subcategory.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#E5D3B3] hover:text-[#7C5C27] transition-colors"
                              onClick={() => setCatalogOpen(false)}
                            >
                              {subcategory.name}
                            </Link>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                className={`transition-colors ${textColor} hover:text-[#7C5C27]`}
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
                <div className="flex flex-col gap-2">
                  {catalogStructure.map((category) => (
                    <details key={category.href}>
                      <summary className="font-semibold cursor-pointer py-2">
                        {category.name}
                      </summary>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <ul className="pl-4 text-sm text-gray-700">
                          {category.subcategories.map((subcategory) => (
                            <li key={subcategory.href}>
                              <Link 
                                href={subcategory.href}
                                className="block py-1"
                                onClick={toggleMenu}
                              >
                                {subcategory.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </details>
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