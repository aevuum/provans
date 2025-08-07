'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaHeart, FaShoppingCart, FaEye, FaEdit } from 'react-icons/fa';

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  isInStock?: boolean;
}

interface UniversalProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
  showCategory?: boolean;
  showEditButton?: boolean;
  onFavoriteClick?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  isFavorite?: boolean;
  isInCart?: boolean;
}

const UniversalProductCard: React.FC<UniversalProductCardProps> = ({
  product,
  variant = 'default',
  showCategory = true,
  showEditButton = false,
  onFavoriteClick,
  onAddToCart,
  isFavorite = false,
  isInCart = false,
}) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteClick?.(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product.id);
  };

  const discountPercentage = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const cardClasses = `
    product-card
    ${variant === 'compact' ? 'product-card--compact' : ''}
    ${variant === 'featured' ? 'product-card--featured' : ''}
    ${!product.isInStock ? 'product-card--out-of-stock' : ''}
  `.trim();

  return (
    <div className={cardClasses}>
      <div className="product-card__image-container">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
        
        {/* Badges */}
        <div className="product-card__badges">
          {discountPercentage > 0 && (
            <span className="badge badge--discount">-{discountPercentage}%</span>
          )}
          {!product.isInStock && (
            <span className="badge badge--out-of-stock">Нет в наличии</span>
          )}
        </div>

        {/* Action buttons overlay */}
        <div className="product-card__actions">
          <button
            onClick={handleFavoriteClick}
            className={`btn-icon ${isFavorite ? 'btn-icon--active' : ''}`}
            title="Добавить в избранное"
          >
            <FaHeart />
          </button>
          
          <Link href={`/products/${product.id}`} className="btn-icon" title="Просмотр">
            <FaEye />
          </Link>
          
          {isAdmin && showEditButton && (
            <Link href={`/admin/products/${product.id}/edit`} className="btn-icon" title="Редактировать">
              <FaEdit />
            </Link>
          )}
        </div>
      </div>

      <div className="product-card__content">
        {showCategory && product.category && (
          <p className="product-card__category">{product.category}</p>
        )}
        
        <h3 className="product-card__title">
          <Link href={`/products/${product.id}`}>
            {product.title}
          </Link>
        </h3>
        
        <div className="product-card__price-container">
          <span className="product-card__price">{product.price} ₽</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="product-card__original-price">{product.originalPrice} ₽</span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product.isInStock || isInCart}
          className={`btn-primary w-full ${isInCart ? 'btn-primary--in-cart' : ''}`}
        >
          {isInCart ? 'В корзине' : !product.isInStock ? 'Нет в наличии' : 'В корзину'}
          {!isInCart && product.isInStock && <FaShoppingCart className="ml-2" />}
        </button>
      </div>
    </div>
  );
};

export default UniversalProductCard;
