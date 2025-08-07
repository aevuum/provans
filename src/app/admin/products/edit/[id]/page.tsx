'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { FaSave, FaArrowLeft, FaUpload, FaSpinner } from 'react-icons/fa';
import PhotoUploader from '@/components/PhotoUploader';

interface Product {
  id: number;
  title: string;
  price: number;
  size?: string | null;
  material?: string | null;
  country?: string | null;
  barcode?: string | null;
  comment?: string | null;
  image?: string | null;
  images?: string[];
  isConfirmed: boolean;
  discount: number;
  category?: string | null;
}

export default function EditProductPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const productId = parseInt(params.id as string);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    size: '',
    material: '',
    country: '',
    barcode: '',
    comment: '',
    category: '',
    discount: ''
  });

  // Загрузка данных товара
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`);
        if (response.ok) {
          const productData = await response.json();
          setProduct(productData);
          
          // Предзаполняем форму
          setFormData({
            title: productData.title || '',
            price: productData.price?.toString() || '',
            size: productData.size || '',
            material: productData.material || '',
            country: productData.country || '',
            barcode: productData.barcode || '',
            comment: productData.comment || '',
            category: productData.category || '',
            discount: productData.discount?.toString() || '0'
          });
        } else {
          router.push('/admin/products/moderation');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        router.push('/admin/products/moderation');
      } finally {
        setLoading(false);
      }
    };

    if (productId && session?.user) {
      fetchProduct();
    }
  }, [productId, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpdate = (newImageUrl: string) => {
    setProduct(prev => prev ? { ...prev, image: newImageUrl } : null);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          discount: parseFloat(formData.discount) || 0,
        }),
      });

      if (response.ok) {
        router.push('/admin/products/moderation');
      } else {
        alert('Ошибка при сохранении товара');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ошибка при сохранении товара');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Товар не найден</h1>
          <button
            onClick={() => router.push('/admin/products/moderation')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Вернуться к модерации
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/admin/products/moderation')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Редактирование товара</h1>
                  <p className="text-gray-600">ID: {product.id}</p>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Сохранить
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Левая колонка - Изображение */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Изображение товара</h2>
            
            {/* Текущее изображение */}
            <div className="mb-6">
              <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FaUpload className="w-12 h-12 mb-2" />
                    <span>Нет изображения</span>
                  </div>
                )}
              </div>
            </div>

            {/* Загрузка фото */}
            <PhotoUploader 
              productId={product.id}
              currentImage={product.image}
              currentImages={product.images || []}
              onImageUpdate={handleImageUpdate}
              onImagesUpdate={(newImages) => {
                setProduct(prev => prev ? { ...prev, images: newImages } : null);
              }}
            />
          </div>

          {/* Правая колонка - Форма */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Информация о товаре</h2>
            
            <form className="space-y-4">
              {/* Название */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название товара *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Цена */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Размер */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Размер
                </label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Материал */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Материал
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Страна */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Страна производитель
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Артикул */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Артикул
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Категория */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Скидка */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Скидка (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Комментарий */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Комментарий
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
