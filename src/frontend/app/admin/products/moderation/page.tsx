'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaCheck, FaTimes, FaEdit, FaEye, FaTrash, FaCheckDouble } from 'react-icons/fa';
import { Product } from '../../../../types/index';

export default function ModerationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderating, setModerating] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [targetCategory, setTargetCategory] = useState<string>("");
  const [confirmedIndex, setConfirmedIndex] = useState<{ titles: Map<string, number>; barcodes: Map<string, number> } | null>(null);

  const fetchPendingProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/products?status=pending&limit=500');
      if (response.ok) {
        const result = await response.json();
        // API возвращает объект с data и meta
        const products = result.data || result;
        console.log('Loaded pending products:', products.length);
        setProducts(products);
      } else {
        console.error('Failed to fetch products:', response.status, response.statusText);
        if (response.status === 403) {
          router.push('/admin');
        }
      }
    } catch (_error) {
      console.error('Error fetching products:', _error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || !(session.user && 'role' in session.user && (session.user as any).role === 'admin')) {
      router.push('/admin');
      return;
    }

    fetchPendingProducts();
    // подтянем индекс подтвержденных для подсветки дублей
    (async () => {
      try {
        const res = await fetch('/api/admin/products?status=confirmed&limit=1000');
        if (!res.ok) return;
        const data = await res.json();
        const list: Product[] = data?.data || [];
        const titles = new Map<string, number>();
        const barcodes = new Map<string, number>();
        const norm = (t?: string|null) => (t||'').toLowerCase().replace(/\s+/g,' ').trim();
        for (const p of list) {
          titles.set(`${norm(p.title)}|${p.price}`, p.id);
          if (p.barcode) barcodes.set(p.barcode, p.id);
        }
        setConfirmedIndex({ titles, barcodes });
      } catch {}
    })();
  }, [session, router, fetchPendingProducts]);

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(products.map(p => p.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const bulkAction = async (action: 'confirm' | 'delete') => {
    const ids = [...selected];
    if (ids.length === 0) return;
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, productIds: ids })
      });
      if (res.ok) {
        if (action === 'confirm' || action === 'delete') {
          setProducts(prev => prev.filter(p => !selected.has(p.id)));
          clearSelection();
        }
      }
    } catch (e) {
      console.error('Bulk error', e);
    }
  };

  const bulkMoveCategory = async () => {
    const ids = [...selected];
    if (ids.length === 0 || !targetCategory) return;
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move-category', productIds: ids, category: targetCategory })
      });
      if (res.ok) {
        // локально обновим категории
        setProducts(prev => prev.map((p) => selected.has(p.id) ? ({ ...p, category: targetCategory }) : p));
      }
    } catch (e) {
      console.error('Bulk move error', e);
    }
  };

  const bulkMoveAndConfirm = async () => {
    const ids = [...selected];
    if (ids.length === 0 || !targetCategory) return;
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move-and-confirm', productIds: ids, category: targetCategory })
      });
      if (res.ok) {
        // удалим одобренные из списка
        const data = await res.json();
        const skipped: number[] = data?.skipped || [];
        setProducts(prev => prev.filter(p => skipped.includes(p.id) ? true : !selected.has(p.id)));
        clearSelection();
      }
    } catch (e) {
      console.error('Bulk move+confirm error', e);
    }
  };

  const deleteDuplicates = async () => {
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete-duplicates' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Ошибка удаления дублей');
      alert(`Дубликаты удалены: ${data.affected || 0}`);
      setProducts(prev => prev.filter(p => !(data.deletedIds || []).includes(p.id)));
    } catch (e) {
      console.error('Delete duplicates error', e);
      alert('Не удалось удалить дубликаты');
    }
  };

  const handleApprove = async (productId: number) => {
    // Найдем товар для проверки
    const product = products.find(p => p.id === productId);
    
    // Проверяем наличие фото
    if (!product?.images || product.images.length === 0 || 
        !product.images.some(img => img && img.trim() !== '')) {
      alert('Ошибка: Товар не может быть одобрен без фотографии! Добавьте хотя бы одно изображение.');
      return;
    }

    setModerating(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      } else {
        const data = await response.json();
        alert(`Ошибка при одобрении: ${data.message || 'Неизвестная ошибка'}`);
      }
    } catch (_error) {
      console.error('Error approving product:', _error);
      alert('Ошибка при одобрении товара');
    } finally {
      setModerating(null);
    }
  };

  const handleReject = async (productId: number) => {
    setModerating(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      }
    } catch (_error) {
      console.error('Error rejecting product:', _error);
    } finally {
      setModerating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const isPlaceholder = (src?: string | null) => {
    if (!src) return true;
    const s = src.trim().toLowerCase();
    return s.endsWith('/fon.png') || s.endsWith('/fonc.png') || s.endsWith('/fonb.png') || s.endsWith('/placeholder.jpg');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Модерация товаров</h1>
                <p className="text-gray-600">Товары ожидающие подтверждения</p>
              </div>
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                {products.length} товаров на модерации
              </div>
            </div>
          </div>
        </div>

        {/* Bulk actions */}
  <div className="bg-white shadow rounded-lg p-4 mb-4 flex items-center gap-2 flex-wrap">
          <button onClick={selectAll} className="px-3 py-2 text-sm bg-gray-100 rounded">Выбрать все</button>
          <button onClick={clearSelection} className="px-3 py-2 text-sm bg-gray-100 rounded">Сбросить</button>
          <div className="flex items-center gap-2">
            <select value={targetCategory} onChange={e=>setTargetCategory(e.target.value)} className="px-2 py-2 text-sm border rounded">
              <option value="">Переместить в категорию…</option>
              <option value="vases">Вазы</option>
              <option value="candlesticks">Подсвечники</option>
              <option value="frames">Рамки</option>
              <option value="flowers">Цветы</option>
              <option value="jewelry-boxes">Шкатулки</option>
              <option value="figurines">Фигурки</option>
              <option value="bookends">Книгодержатели</option>
            </select>
            <button onClick={bulkMoveCategory} disabled={selected.size===0 || !targetCategory} className="px-3 py-2 text-sm bg-indigo-600 text-white rounded disabled:opacity-50">Переместить</button>
            <button onClick={bulkMoveAndConfirm} disabled={selected.size===0 || !targetCategory} className="px-3 py-2 text-sm bg-indigo-700 text-white rounded disabled:opacity-50">Переместить и одобрить</button>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={() => bulkAction('confirm')} disabled={selected.size===0} className="px-3 py-2 text-sm bg-green-600 text-white rounded inline-flex items-center gap-1 disabled:opacity-50"><FaCheckDouble/> Одобрить выбранные</button>
            <button onClick={() => bulkAction('delete')} disabled={selected.size===0} className="px-3 py-2 text-sm bg-red-600 text-white rounded inline-flex items-center gap-1 disabled:opacity-50"><FaTrash/> Удалить выбранные</button>
            <button onClick={deleteDuplicates} className="px-3 py-2 text-sm bg-orange-600 text-white rounded inline-flex items-center gap-1"><FaTrash/> Удалить дубликаты</button>
          </div>
        </div>

        {/* Products List */}
        {products.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Все товары проверены!</h3>
            <p className="text-gray-600">Нет товаров ожидающих модерации.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="flex items-center px-4 pt-3">
                  <input type="checkbox" className="mr-2" checked={selected.has(product.id)} onChange={() => toggleSelect(product.id)} />
                  <span className="text-sm text-gray-500">#{product.id}</span>
                </div>
                {/* Product Image */}
                <div className="relative h-56 bg-gray-100 flex items-center justify-center">
                  {product.image && product.image.startsWith('/') && !isPlaceholder(product.image) ? (
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        console.error('Image failed to load:', product.image);
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FaEye className="w-8 h-8 mb-2" />
                      <span className="text-sm">
                        {'Нет изображения'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Цена:</span>
                      <span className="font-medium">{product.price.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    {product.category && (
                      <div className="flex justify-between">
                        <span>Категория:</span>
                        <span className="font-medium">{product.category}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Артикул:</span>
                      <span className="font-medium">{product.barcode}</span>
                    </div>
                    {confirmedIndex && (
                      (() => {
                        const norm = (t?: string|null) => (t||'').toLowerCase().replace(/\s+/g,' ').trim();
                        const key = `${norm(product.title)}|${product.price}`;
                        const dupId = (product.barcode && confirmedIndex.barcodes.get(product.barcode)) || confirmedIndex.titles.get(key);
                        return dupId ? (
                          <div className="text-xs text-orange-600">Похож на подтверждённый #{dupId}</div>
                        ) : null;
                      })()
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(product.id)}
                      disabled={moderating === product.id}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-1"
                    >
                      <FaCheck />
                      <span>Одобрить</span>
                    </button>
                    <button
                      onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                      className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleReject(product.id)}
                      disabled={moderating === product.id}
                      className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
