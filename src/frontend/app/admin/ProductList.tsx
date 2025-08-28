import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import ProductCardAdmin from '../components/ProductCardAdmin';
import ProductEditModal from './ProductEditModal';
import { Product } from '@/types'; // Импортируй тип Product

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