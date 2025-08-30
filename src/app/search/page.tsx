'use client'

import SearchContent from '@/components/SearchContent'
import { Suspense } from 'react'

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Поиск товаров
          </h1>
        </div>
        
        <Suspense fallback={<div className="text-center py-8">Загрузка...</div>}>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  )
}
