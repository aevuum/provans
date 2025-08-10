'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Product } from '@/types'
import PhotoUploader from '@/components/PhotoUploader'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AdminProductEditPage({ params }: PageProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [id, setId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Partial<Product>>({
    title: '',
    price: 0,
    size: '',
    barcode: '',
    comment: '',
    image: '',
    images: [],
    isConfirmed: false,
    discount: 0,
    category: ''
  })

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!id) return

    async function fetchProduct() {
      try {
        const response = await fetch(`/api/admin/products/${id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct({
            ...data,
            images: Array.isArray(data.images) ? data.images : []
          })
        }
      } catch (_error) {
        console.error('Error fetching product:', _error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || (session.user as any)?.role !== 'admin') {
    router.push('/admin')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const body = {
        ...product,
        price: Number(product.price),
        discount: Number(product.discount) || 0,
        // фильтруем пустые строки в images
        images: Array.isArray(product.images)
          ? product.images.map((s) => (s || '').trim()).filter(Boolean)
          : [],
        image: (product.image || '').toString().trim() || null,
      }

      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        router.push(`/admin/products/${id}`)
      } else {
        alert('Ошибка при сохранении товара')
      }
    } catch (_error) {
      console.error('Error saving product:', _error)
      alert('Ошибка при сохранении товара')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleImageChange = (index: number, value: string) => {
    setProduct(prev => {
      const arr = Array.isArray(prev.images) ? [...prev.images] : []
      arr[index] = value
      return { ...prev, images: arr }
    })
  }

  const addImageField = () => {
    setProduct(prev => ({ ...prev, images: [ ...(Array.isArray(prev.images) ? prev.images : []), '' ]}))
  }

  const removeImageField = (index: number) => {
    setProduct(prev => {
      const arr = Array.isArray(prev.images) ? [...prev.images] : []
      arr.splice(index, 1)
      return { ...prev, images: arr }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Заголовок */}
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Редактировать товар
            </h1>
            <button
              onClick={() => router.back()}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Назад
            </button>
          </div>
          {/* Отображение ID товара (для админа) */}
          <div className="mb-6 text-sm text-gray-600">
            ID товара: <span className="font-mono">{id}</span>
          </div>

          {/* Форма */}
          <div className="bg-white rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название *
                </label>
                <input
                  type="text"
                  name="title"
                  value={product.title || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цена *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={product.price || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Скидка (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={product.discount || ''}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категория
                </label>
                <select
                  name="category"
                  value={product.category || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Размер
                  </label>
                  <input
                    type="text"
                    name="size"
                    value={product.size || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Штрихкод
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    value={product.barcode || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Изображение (основное, URL)
                </label>
                <input
                  type="url"
                  name="image"
                  value={(product.image as string) || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Дополнительные изображения */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Дополнительные изображения (URL)
                  </label>
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Добавить
                  </button>
                </div>
                <div className="space-y-2">
                  {(Array.isArray(product.images) ? product.images : []).map((img, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="url"
                        value={img || ''}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageField(idx)}
                        className="px-3 py-2 text-red-600 hover:text-red-700 text-sm"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Загрузка фото с компьютера */}
              <div>
                <PhotoUploader
                  productId={Number(id) || 0}
                  currentImage={(product.image as string) || undefined}
                  currentImages={(Array.isArray(product.images) ? product.images : []) as string[]}
                  onImageUpdate={(newUrl) => setProduct(prev => ({ ...prev, image: newUrl }))}
                  onImagesUpdate={(arr) => setProduct(prev => ({ ...prev, images: arr }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарий
                </label>
                <textarea
                  name="comment"
                  value={product.comment || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isConfirmed"
                  checked={product.isConfirmed || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Подтвержден
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                
                {/* Кнопка "Вернуть в модерацию" */}
                {product.isConfirmed && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Вернуть товар в модерацию? Он станет неподтвержденным.')) {
                        try {
                          setSaving(true);
                          const response = await fetch(`/api/admin/products/${id}/moderation`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'back_to_moderation' })
                          });
                          
                          if (response.ok) {
                            setProduct(prev => ({ ...prev, isConfirmed: false }));
                            alert('Товар возвращен в модерацию');
                          } else {
                            throw new Error('Ошибка при возврате в модерацию');
                          }
                        } catch (_error) {
                          alert('Ошибка: ' + (_error as Error).message);
                        } finally {
                          setSaving(false);
                        }
                      }
                    }}
                    disabled={saving}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    {saving ? 'Обработка...' : 'Вернуть в модерацию'}
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
