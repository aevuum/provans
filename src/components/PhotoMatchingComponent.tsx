'use client';

import { useState } from 'react';
import { FaUpload, FaCheck, FaTimes } from 'react-icons/fa';

interface PhotoMatchingProps {
  onComplete?: () => void;
}

interface MatchResult {
  productTitle: string;
  photoFile: string;
  matched: boolean;
  productId?: number;
}

export default function PhotoMatchingComponent({ onComplete }: PhotoMatchingProps) {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePhotoMatching = async () => {
    setLoading(true);
    setProgress(0);
    
    try {
      // Получаем список товаров без фото
      const productsResponse = await fetch('/api/admin/products?limit=1000');
      const productsData = await productsResponse.json();
      const products = productsData.data || [];
      
      // Получаем список фото из API
      const photosResponse = await fetch('/api/admin/photos');
      const photosData = await photosResponse.json();
      const photoFiles = photosData.files || [];
      
      const matchResults: MatchResult[] = [];
      let processed = 0;
      
      for (const product of products) {
        // Ищем фото по названию товара (каждый раз заново, независимо от наличия изображения)
        let productName = product.title.trim();
        
        // Обрабатываем специальные символы в названиях для корректного сопоставления
        // Заменяем двойные кавычки на одинарные
        productName = productName.replace(/""([^"]*)""/g, '"$1"');
        // Заменяем слэши на двоеточия (как в файлах)
        productName = productName.replace(/\//g, ':');
        // Заменяем знаки равенства на дефисы
        productName = productName.replace(/=/g, '-');
        
        // Ищем соответствующий файл фото с более умной логикой
        const matchingPhoto = photoFiles.find((photo: string) => {
          // Убираем расширение из имени файла
          const photoNameWithoutExt = photo.replace(/\.(jpeg|jpg|png)$/i, '');
          
          // 1. Проверяем точное совпадение названия товара с именем файла
          if (photoNameWithoutExt === productName) {
            return true;
          }
          
          // 2. Убираем номера из названий товаров (например "лампа 2" -> "лампа")
          const productNameBase = productName.replace(/\s+\d+$/, '').trim();
          if (photoNameWithoutExt === productNameBase) {
            return true;
          }
          
          // 3. Проверяем частичное совпадение (базовое название содержится в фото)
          if (productNameBase.length > 3 && photoNameWithoutExt.includes(productNameBase)) {
            return true;
          }
          
          // 4. Проверяем обратное частичное совпадение (фото содержится в названии)
          if (photoNameWithoutExt.length > 3 && productNameBase.includes(photoNameWithoutExt)) {
            return true;
          }
          
          return false;
        });
        
        matchResults.push({
          productTitle: product.title,
          photoFile: matchingPhoto || 'Не найдено',
          matched: !!matchingPhoto,
          productId: product.id
        });
        
        // Если найдено совпадение, обновляем товар
        if (matchingPhoto) {
          await fetch(`/api/admin/products/${product.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: `/фото/${matchingPhoto}`
            })
          });
        }
        
        processed++;
        setProgress((processed / products.length) * 100);
      }
      
      setResults(matchResults);
      
    } catch (_error) {
      console.error('Ошибка привязки фото:', _error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-yellow-800">
            🚧 Автоматическая привязка фотографий
          </h3>
          <p className="text-sm text-yellow-700">
            Этот компонент автоматически привязывает фото к товарам по названию. 
            В будущем будет удален после ручной загрузки всех фото.
          </p>
        </div>
        <button
          onClick={handlePhotoMatching}
          disabled={loading}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"
        >
          <FaUpload />
          {loading ? 'Обработка...' : 'Привязать фото'}
        </button>
      </div>
      
      {loading && (
        <div className="mb-4">
          <div className="bg-yellow-200 rounded-full h-2">
            <div 
              className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Прогресс: {Math.round(progress)}%
          </p>
        </div>
      )}
      
      {results.length > 0 && (
        <div className="max-h-96 overflow-y-auto">
          <h4 className="font-medium text-yellow-800 mb-2">
            Результаты привязки ({results.filter(r => r.matched).length} из {results.length}):
          </h4>
          <div className="space-y-2">
            {results.slice(0, 10).map((result, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {result.matched ? (
                  <FaCheck className="text-green-600" />
                ) : (
                  <FaTimes className="text-red-600" />
                )}
                <span className="flex-1">{result.productTitle}</span>
                <span className={result.matched ? 'text-green-600' : 'text-red-600'}>
                  {result.photoFile}
                </span>
              </div>
            ))}
            {results.length > 10 && (
              <p className="text-sm text-yellow-700">
                ... и еще {results.length - 10} товаров
              </p>
            )}
          </div>
        </div>
      )}
      
      {onComplete && results.length > 0 && (
        <button
          onClick={onComplete}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Завершить и обновить список
        </button>
      )}
    </div>
  );
}
