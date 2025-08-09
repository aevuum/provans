'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { updateProduct, confirmProduct } from '@/lib/features/products/productsSlice';
import { Product } from '@/types';

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductEditModal({ product, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState(product);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    // Для числовых полей приводим к числу
    if (type === 'number' && name in form) {
      setForm({ ...form, [name]: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = () => {
    dispatch(updateProduct(form));
    onClose();
  };

  const handleConfirm = () => {
    dispatch(confirmProduct(form.id));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Редактировать товар</h2>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
          placeholder="Название"
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
          placeholder="Цена"
        />
        <select
          name="category"
          value={form.category || ''}
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
        >
          <option value="">Выберите категорию</option>
          <option value="vases">Вазы</option>
          <option value="candlesticks">Подсвечники</option>
          <option value="frames">Рамки</option>
          <option value="flowers">Цветы</option>
          <option value="jewelry-boxes">Шкатулки</option>
          <option value="figurines">Фигурки</option>
          <option value="bookends">Книгодержатели</option>
        </select>
        {/* Остальные поля при необходимости */}
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">Сохранить</button>
          <button onClick={handleConfirm} className="bg-green-600 text-white px-4 py-2 rounded">Подтвердить</button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Отмена</button>
        </div>
      </div>
    </div>
  );
}