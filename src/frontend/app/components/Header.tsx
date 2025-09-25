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
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import type { RootState } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getProductImage } from '../../types/index';
import { toggleSearch } from '@/lib/features/ui/uiSlice';
import type { CartItem } from '@/lib/features/cart/cartSlice';
import AuthModal from './AuthModal';
import { SearchBar } from './SearchBar';

export const Header = React.memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartPopoverOpen, setCartPopoverOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const showSearch = useAppSelector((state: RootState) => state.ui.showSearch);
  const [mounted, setMounted] = useState(false);
  const [isSearchLight, setIsSearchLight] = useState(true);

  const pathname = usePathname();
  useEffect(() => setMounted(true), []);

  const isHome = pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    if (!isHome) {
      setIsSearchLight(false);
      return;
    }
    const onScroll = () => {
      const scrolled = window.scrollY > 40;
      setIsScrolled(scrolled);
      setIsSearchLight(!scrolled);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const cart = useAppSelector((state: RootState) => state.cart.items);
  const favorites = useAppSelector((state: RootState) => state.favorites.items);

  const cartTotal = useMemo(
    () => cart.reduce((sum: number, item: CartItem) => sum + (item.price * (item.count || 1)), 0),
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

  const [catalogOpen, setCatalogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCategoryRef, setActiveCategoryRef] = useState<HTMLDivElement | null>(null);
  // Таймеры для наведения только для каталога (поповер профиля отключен)
  const hoverTimers = useRef<{ catalog?: ReturnType<typeof setTimeout> }>({});

  const openWithDelay = (key: 'catalog') => {
    if (hoverTimers.current[key]) clearTimeout(hoverTimers.current[key]);
    hoverTimers.current[key] = setTimeout(() => {
      setCatalogOpen(true);
    }, 120);
  };
  const closeWithDelay = (key: 'catalog') => {
    if (hoverTimers.current[key]) clearTimeout(hoverTimers.current[key]);
    hoverTimers.current[key] = setTimeout(() => {
      setCatalogOpen(false);
      setActiveCategory(null);
      setActiveCategoryRef(null);
    }, 200);
  };

  // Блокируем скролл страницы, когда открыто боковое меню (моб./планшет)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    const originalOverflow = body.style.overflow;
    if (isMenuOpen) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = originalOverflow || '';
    }
    return () => {
      body.style.overflow = originalOverflow || '';
    };
  }, [isMenuOpen]);

  const catalogStructure = [
    {
      name: 'Декор',
      href: '/catalog/decor',
      subcategories: [
        { name: 'Фоторамки', href: '/catalog/frames' },
        { name: 'Вазы', href: '/catalog/vases' },
        { name: 'Зеркала', href: '/catalog/decor?subcategory=mirrors' },
        { name: 'Подсвечники', href: '/catalog/candlesticks' },
        { name: 'Шкатулки', href: '/catalog/jewelry-boxes' },
        { name: 'Интерьерные фигуры', href: '/catalog/decor?subcategory=figurines' },
        { name: 'Часы', href: '/catalog/decor?subcategory=clocks' },
        { name: 'Садовый декор и фигуры', href: '/catalog/decor?subcategory=garden' },
      ]
    },
    {
      name: 'Искусственные цветы',
      href: '/catalog/flowers',
      subcategories: [
        { name: 'Интерьерные композиции', href: '/catalog/flowers?subcategory=arrangements' },
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

  // Стили для хедера и элементов
  const headerBg = isHome && !isScrolled ? 'bg-transparent' : 'bg-[#2e3526] shadow-sm';
  // Держим иконки белыми, чтобы не чернела иконка поиска при открытом меню
  const iconColor = 'text-white';
  const hoverColor = 'hover:text-[var(--color-primary-200)] transition-colors duration-200';

  // Use existing logo asset from public/icons
  const logoSrc = '/icons/provans-white5.png';

  // Меню для навигации
  // Nav links — restored original order
  const navLinks = [
  { name: 'Новинки', href: '/catalog/new', style: '' },
  { name: 'Акции', href: '/discount', style: '' },
  { name: 'О нас', href: '/about', style: '' },
  { name: 'Блог', href: '/blog', style: '' },
  { name: 'Контакты', href: '/contacts', style: '' },
  ];

  return (
    <header className={`site-header fixed top-0 left-0 w-full z-50 transition-all duration-300 ${headerBg} font-sans`}>
      {/* Мобильный поиск */}
      {showSearch && (
        <div
          className="fixed inset-0 z-[9999] bg-black/40 flex items-start justify-center pt-16 px-2"
          onClick={(e) => { if (e.target === e.currentTarget) dispatch(toggleSearch(false)); }}
        >
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-4 relative">
            <SearchBar isMobile />
            {/* Cross removed — overlay closes by clicking on backdrop */}
          </div>
        </div>
      )}

      {/* Top Bar */}
  <div className="px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Burger + Logo */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={toggleMenu}
              className={`lg:hidden ${iconColor} ${hoverColor} cursor-pointer`}
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
      {/* Не переключаем на крестик рядом с логотипом, чтобы не было лишней иконки закрытия */}
      <FaBars className="w-6 h-6" />
            </button>
            <Link
              href="/"
              className="relative h-12 w-20 sm:w-24 md:w-28 lg:w-[88px] xl:w-[96px] 2xl:w-32 transition-all duration-300 flex-shrink-0 cursor-pointer ml-0 lg:ml-6"
            >
              <Image
                src={logoSrc}
                alt="Логотип"
                fill
                className={`object-contain`}
                priority
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, (max-width: 1400px) 120px, 128px"
              />
            </Link>
            {/* Контакты */}
            <div className="hidden lg:flex flex-col ml-3">
              <div className="flex items-center gap-2">
                <FaPhone className={`text-white hover:text-[var(--color-primary-200)] transition-colors`} />
                <a
                  href="tel:88007771872"
                  className={`font-medium text-sm text-white hover:text-[var(--color-primary-200)] transition-colors`}
                >
                  <span className="tabular-nums">8 (800) 777-18-72</span>
                </a>
              </div>
              <p className={`text-xs mt-1 ml-5 text-white/70`}>
                с 10:00 до 21:00
              </p>
            </div>
          </div>
          {/* Icons */}
          <div className="flex items-center justify-end gap-4 md:gap-5 lg:gap-6 flex-1">
            <div className="hidden lg:block w-full max-w-xl">
              {/* Desktop Search */}
              <div className="hidden lg:block w-full max-w-xl">
                <SearchBar 
                  placeholder="Поиск товаров..." 
                  className={isSearchLight 
                    ? 'text-white placeholder-white focus:ring-white/50 focus:border-white border-white/30 hover:border-white/50' 
                    : 'text-white placeholder-white border-white/30'
                  }
                />
              </div>
            </div>
              <button
                className={`transition-colors lg:hidden text-white hover:text-[var(--color-primary-200)] cursor-pointer`}
              onClick={() => dispatch(toggleSearch(true))}
                aria-label="Поиск"
              >
                <FaSearch className="w-5 h-5" />
              </button>
              <button
                className={`relative transition-colors text-white hover:text-[var(--color-primary-200)] cursor-pointer`}
                onClick={() => router.push('/favorites')}
                aria-label="Избранное"
              >
                <FaHeart className="w-6 h-6" />
              {mounted && favorites.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--color-primary-400)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>
            <button
              className={`transition-colors text-white hover:text-[var(--color-primary-200)] cursor-pointer`}
              onClick={onUserIconClick}
              aria-label="Профиль"
            >
              <FaUser className="w-6 h-6" />
            </button>
            <div
              className="relative"
              onMouseEnter={() => {
                if (window.innerWidth >= 768) setCartPopoverOpen(true);
              }}
              onMouseLeave={() => {
                if (window.innerWidth >= 768) closeCartWithDelay();
              }}
            >
              <button
                className={`relative transition-colors text-white hover:text-[var(--color-primary-200)] cursor-pointer`}
                aria-label="Корзина"
                tabIndex={0}
                onClick={() => router.push('/cart')}
              >
                <FaShoppingBag className="w-6 h-6" />
                {mounted && cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--color-primary-400)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              {cartPopoverOpen && (
                <div
                  className="hidden md:block absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg z-50 p-4 min-w-[320px]"
                  onMouseEnter={() => setCartPopoverOpen(true)}
                  onMouseLeave={closeCartWithDelay}
                >
                  <h3 className="font-bold mb-2 text-lg">Корзина</h3>
                  {cart.length === 0 ? (
                    <div className="text-gray-400 text-sm">Корзина пуста</div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {cart.slice(0, 4).map((item: CartItem) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className="relative w-20 h-20 flex-shrink-0 rounded bg-white overflow-hidden">
                            <Image
                              src={getProductImage(item)}
                              alt={item.title}
                              fill
                              className="object-contain"
                              sizes="80px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm leading-snug line-clamp-2 break-words">{item.title}</div>
                            <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                              <span className="font-semibold">{item.price.toLocaleString('ru-RU')} ₽</span>
                              <span className="text-xs text-gray-400">× {item.count || 1}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {cart.length > 3 && (
                        <div className="text-xs text-gray-400">+ ещё {cart.length - 4} товаров</div>
                      )}
                    </div>
                  )}
                  <div className="mt-4">
                    <div className="flex justify-between font-semibold mb-2">
                      <span>Итого:</span>
                      <span>{cartTotal.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <button
                      className="w-full bg-[var(--color-primary-400)] text-white py-2 rounded hover:bg-[var(--color-primary-200)] transition font-semibold"
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
      <div className={`hidden lg:block border-t  transition-all duration-300 border-white/20`}>
        <div className="container mx-auto px-4 py-1">
          <nav className="flex items-center justify-center gap-6">
            <li
              className="relative list-none"
              onMouseEnter={() => openWithDelay('catalog')}
              onMouseLeave={() => closeWithDelay('catalog')}
            >
              <button
                type="button"
                className={`flex items-center gap-1 rounded-md px-4 py-2 transition-colors text-white hover:text-[var(--color-primary-200)] nav-link`}
                onClick={() => setCatalogOpen(v => !v)}
                aria-expanded={catalogOpen}
              >
                Каталог
                <FaChevronDown className={`catalog-chevron ml-1 h-3 w-3 transition-transform ${catalogOpen ? 'rotate-180' : ''}`} />
              </button>
              {/* Выпадающее меню каталога */}
              {catalogOpen && (
                <div
                  className="absolute left-0 top-full z-50 bg-white rounded-md shadow-lg py-2"
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
                        >
                          <Link
                            href={category.href}
                            className={`block px-4 py-2 transition-colors rounded ${activeCategory === category.name ? 'bg-[var(--color-primary-400)] text-white' : 'text-gray-800 hover:bg-[var(--color-primary-400)] hover:text-white'}`}
                            onClick={() => setCatalogOpen(false)}
                            style={{
                              fontFamily: 'var(--footer-heading)',
                              fontWeight: 400,
                              fontSize: '1.1rem',
                            }}
                          >
                            {category.name}
                          </Link>
                        </div>
                      ))}
                    </div>
                    {/* Подкатегории */}
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
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-[var(--color-primary-400)] hover:text-white transition-colors"
                              onClick={() => setCatalogOpen(false)}
                              style={{
                                fontFamily: 'var(--footer-heading)',
                                fontWeight: 400,
                              }}
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
            {navLinks.map((link) => {
              const linkClass = 'nav-link';
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${linkClass} transition-colors text-white hover:text-[var(--color-primary-200)] px-4 py-2 rounded-md ${link.style}`}
                >
                  {link.name}
                </Link>
              );
            })}
           
          </nav>
        </div>
      </div>

      {/* Mobile/Tablet Side Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop to darken the rest; click to close */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={toggleMenu}
            aria-hidden="true"
          />
          {/* Side panel: full width on mobile, half width on md+ */}
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-full sm:w-1/2 max-w-full bg-[var(--background)] fabric-surface shadow-menu text-black pt-20 px-6 flex flex-col">
            <button
              aria-label="Закрыть меню"
              onClick={toggleMenu}
              className="absolute top-4 right-4 p-2 rounded-md text-black hover:bg-gray-100"
            >
              <FaTimes className="w-5 h-5" />
            </button>
            <nav className="flex flex-col gap-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent max-h-[calc(100vh-6rem)]">
              <div className="mb-4">
                <Link
                  href="/catalog/all-category"
                  className="text-lg font-medium text-black mb-2 block hover:text-[var(--color-primary-200)] transition-colors"
                  style={{ fontFamily: 'var(--footer-heading)' }}
                  onClick={toggleMenu}
                >
                  Каталог
                </Link>
                <div className="flex flex-col gap-2">
                  {catalogStructure.map((category) => (
                    <details key={category.href} className="group" data-has-sub={category.subcategories && category.subcategories.length > 0}>
                      <summary className="font-semibold cursor-pointer py-2 text-black flex items-center justify-between" style={{ fontFamily: 'var(--footer-heading)' }}>
                        <Link href={category.href} onClick={toggleMenu} className="block">{category.name}</Link>
                        {category.subcategories && category.subcategories.length > 0 && (
                          <span className="ml-2 text-black/50 group-open:rotate-180 transition-transform"><FaChevronDown /></span>
                        )}
                      </summary>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <ul className="pl-4 text-sm text-black/80">
                          {category.subcategories.map((subcategory) => (
                            <li key={subcategory.href}>
                              <Link 
                                href={subcategory.href}
                                className="block py-1 hover:text-[var(--color-primary-200)] text-black"
                                onClick={toggleMenu}
                                style={{ fontFamily: 'var(--footer-heading)' }}
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
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    text-black py-3 text-lg border-t border-white/20 hover:text-[var(--color-primary-200)] transition-colors
                    ${item.style}
                  `}
                  style={{ fontFamily: 'var(--footer-heading)', fontWeight: 500 }}
                  onClick={toggleMenu}
                >
                  {item.name}
                </Link>
              ))}
              <a
                href="tel:88007771872"
                className="font-medium text-black hover:text-[var(--color-primary-200)] transition-colors mt-4"
                style={{ fontFamily: 'inherit' }}
              >
                <FaPhone className="inline mr-2" />
                8 (800) 777-18-72
              </a>
              <p className="text-xs text-black/70 mb-4">с 09:00 до 21:00</p>
              <div className="h-8 w-full flex-shrink-0" aria-hidden="true" />
            </nav>
          </aside>
        </>
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