'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FaUpload, FaTrash } from 'react-icons/fa'

const categories = [
  { value: 'vases', label: 'Вазы' },
  { value: 'candlesticks', label: 'Подсвечники' },
  { value: 'frames', label: 'Рамки' },
  { value: 'flowers', label: 'Цветы' },
  { value: 'jewelry-boxes', label: 'Шкатулки' },
  { value: 'figurines', label: 'Фигурки' },
  { value: 'bookends', label: 'Книгодержатели' }
]

export default function AdminProductNewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [product, setProduct] = useState({
    title: '',
    price: '',
    size: '',
    barcode: '',
    comment: '',
    image: '',
    category: '',
    quantity: '1'
  })

  // Проверка доступа
  if (!session || (session.user as { role?: string })?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h1>
          <p className="text-gray-600 mb-4">У вас нет прав для просмотра этой страницы.</p>
          <button 
            onClick={() => router.push('/admin')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Вернуться к админ-панели
          </button>
        </div>
      </div>
    )
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setProduct(prev => ({ ...prev, image: data.url }))
      } else {
        alert('Ошибка загрузки изображения')
      }
    } catch (_error) {
      console.error('Error uploading image:', _error)
      alert('Ошибка загрузки изображения')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение')
        return
      }
      
      // Проверка размера файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB')
        return
      }
      
      handleImageUpload(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          price: parseFloat(product.price),
          quantity: parseInt(product.quantity),
          isConfirmed: false // Все новые товары требуют модерации
        })
      })

      if (response.ok) {
        router.push('/admin/products/moderation?message=Товар добавлен и отправлен на модерацию')
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка при создании товара')
      }
    } catch (_error) {
      console.error('Error creating product:', _error)
      alert('Ошибка при создании товара')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Добавить новый товар</h1>
            <p className="text-gray-600">Товар будет отправлен на модерацию</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 space-y-6">
            {/* Основная информация */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Основная информация</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название товара *
                  </label>
                  <input
                    type="text"
                    value={product.title}
                    onChange={(e) => setProduct(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.price}
                    onChange={(e) => setProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Категория *
                  </label>
                  <select
                    value={product.category}
                    onChange={(e) => setProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Количество
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={product.quantity}
                    onChange={(e) => setProduct(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Изображение */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Изображение товара</h3>
              
              <div className="space-y-4">
                {product.image ? (
                  <div className="relative inline-block">
                    <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={product.image}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setProduct(prev => ({ ...prev, image: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Загрузите изображение товара</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {uploadingImage ? 'Загрузка...' : 'Выбрать файл'}
                    </button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Дополнительная информация */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Дополнительная информация</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Размер
                  </label>
                  <input
                    type="text"
                    value={product.size}
                    onChange={(e) => setProduct(prev => ({ ...prev, size: e.target.value }))}
                    placeholder="например: 20x15x10 см"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Артикул
                  </label>
                  <input
                    type="text"
                    value={product.barcode}
                    onChange={(e) => setProduct(prev => ({ ...prev, barcode: e.target.value }))}
                    placeholder="автоматически, если не указан"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={product.comment}
                  onChange={(e) => setProduct(prev => ({ ...prev, comment: e.target.value }))}
                  rows={3}
                  placeholder="Описание товара..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving || !product.title || !product.price || !product.category}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Создать товар'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
