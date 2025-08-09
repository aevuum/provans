import React from 'react';

export default function CatalogCategoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Категория товаров
            </h1>
            <div className="text-center py-12">
              <div className="bg-[#F5F1E8] p-8 rounded-lg">
                <p className="text-xl text-gray-600 mb-4">
                  В данной категории пока нет товаров
                </p>
                <p className="text-gray-500">
                  Мы работаем над наполнением каталога
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
