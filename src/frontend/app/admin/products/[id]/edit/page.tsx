'use client';


import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Product } from '../../../../../types/index';

export default function AdminProductEditPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/admin/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          setError('Товар не найден');
        }
      } catch (_error) {
        setError('Ошибка загрузки товара');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || (session.user as any)?.role !== 'admin') {
    router.push('/admin');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Товар не найден'}</h1>
          <button
            onClick={() => router.back()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
  const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error('Ошибка сохранения');
  router.push(`/admin/products/${id}`);
    } catch (e: any) {
      setError(e.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Редактировать товар</h1>
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
            <div>
              <label className="block text-sm font-medium text-gray-700">Название</label>
              <input
                type="text"
                name="title"
                value={product.title}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Цена</label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Описание</label>
              <textarea
                name="description"
                value={product.description || ''}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                rows={4}
              />
            </div>
            {/* Добавьте другие поля по необходимости */}
            {error && <div className="text-red-500">{error}</div>}
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#7C5C27] text-white px-6 py-2 rounded"
                disabled={saving}
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Назад
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}