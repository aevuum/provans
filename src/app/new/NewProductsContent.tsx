'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCardClient from '../components/ProductCardClient'
import ReusableFilters from '../components/ReusableFilters'
import { Product } from '../../types'

export default function NewProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const params = new URLSearchParams(searchParams.toString())
        
        const response = await fetch(`/api/products/new?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Не удалось загрузить новинки')
        }
        
        const data = await response.json()
        setProducts(data.products || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
          className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Фильтры */}
      <div className="lg:w-1/4">
        <ReusableFilters 
          showSearch={true}
          showCategory={true}
          showPrice={true}
          baseUrl="/new"
        />
      </div>

      {/* Список товаров */}
      <div className="lg:w-3/4">
        {products.length > 0 ? (
          <>
            <div className="mb-4 text-gray-600">
              Найдено товаров: {products.length}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCardClient key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Новинки не найдены
            </h3>
            <p className="text-gray-600 mb-4">
              Попробуйте изменить параметры поиска
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
