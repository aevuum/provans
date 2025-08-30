'use client';

import { Product } from "../../types";


export default function ProductCardAdmin({ product, onEdit }: { product: Product, onEdit: () => void }) {
  return (
    <div className="bg-white rounded shadow p-4 flex flex-col">
      <div className="font-bold mb-2">{product.title}</div>
      <div className="mb-2">{product.price.toLocaleString('ru-RU')} ₽</div>
      <div className="mb-2">Категория: {product.category || 'Не указана'}</div>
      <div className="flex gap-2 mt-auto">
        <button onClick={onEdit} className="bg-blue-600 text-white px-3 py-1 rounded">Редактировать</button>
        {product.isConfirmed
          ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded">Подтверждено</span>
          : <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded">Не подтверждено</span>
        }
      </div>
    </div>
  );
}