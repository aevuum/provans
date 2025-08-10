'use client';

import React from 'react';
import Link from 'next/link';
import { FaHome, FaChevronRight } from 'react-icons/fa';

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center text-sm text-gray-500 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {/* Главная */}
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-[#7C5C27] transition-colors"
            aria-label="Главная страница"
          >
            <FaHome className="w-4 h-4" />
          </Link>
        </li>

        {/* Разделитель после главной */}
        {items.length > 0 && (
          <li>
            <FaChevronRight className="w-3 h-3 text-gray-400" />
          </li>
        )}

        {/* Остальные элементы */}
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <li>
              {item.href && index < items.length - 1 ? (
                <Link
                  href={item.href}
                  className="hover:text-[#7C5C27] transition-colors"
                >
                  {item.name}
                </Link>
              ) : (
                <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : ''}>
                  {item.name}
                </span>
              )}
            </li>
            {index < items.length - 1 && (
              <li>
                <FaChevronRight className="w-3 h-3 text-gray-400" />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}

// Утилита для генерации хлебных крошек для каталога
export function generateCatalogBreadcrumbs(category?: string, productTitle?: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];

  // Добавляем каталог
  breadcrumbs.push({
    name: 'Каталог',
    href: '/catalog/all'
  });

  // Добавляем категорию если есть
  if (category) {
    const categoryMap: Record<string, { name: string; href: string }> = {
      'vases': { name: 'Вазы', href: '/catalog/vases' },
      'candlesticks': { name: 'Подсвечники', href: '/catalog/candlesticks' },
      'frames': { name: 'Рамки', href: '/catalog/frames' },
      'flowers': { name: 'Цветы', href: '/catalog/flowers' },
      'jewelry-boxes': { name: 'Шкатулки', href: '/catalog/jewelry-boxes' },
      'figurines': { name: 'Фигурки', href: '/catalog/figurines' },
    };

    const categoryInfo = categoryMap[category];
    if (categoryInfo) {
      breadcrumbs.push({
        name: categoryInfo.name,
        href: productTitle ? categoryInfo.href : undefined
      });
    }
  }

  // Добавляем название товара если есть
  if (productTitle) {
    breadcrumbs.push({
      name: productTitle.length > 50 ? `${productTitle.substring(0, 50)}...` : productTitle
    });
  }

  return breadcrumbs;
}
