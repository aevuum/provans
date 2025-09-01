import { useState } from 'react';
import ProductCardAdmin from '../components/ProductCardAdmin';
import ProductEditModal from './ProductEditModal';
import { useAppSelector } from '../../lib/hooks';
import { Product } from '../../types/index';

export default function ProductList() {
  const products = useAppSelector((state) => state.products.items);
  const [editProduct, setEditProduct] = useState<Product | null>(null); // <--- исправлено

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCardAdmin
            key={product.id}
            product={product}
            onEdit={() => setEditProduct(product)}
          />
        ))}
      </div>
      {editProduct && (
        <ProductEditModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
        />
      )}
    </div>
  );
}