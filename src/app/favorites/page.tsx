'use client';

import ProductCardClient from "../components/ProductCardClient";
import { useAppSelector } from "../../lib/hooks";



export default function FavoritesPage() {
  const favorites = useAppSelector((state) => state.favorites.items);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold mb-6">Избранное</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {favorites.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">Спикок избраных товаров пуст</p>
          </div>
        ) : (
          favorites.map((product) => (
            <ProductCardClient key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}