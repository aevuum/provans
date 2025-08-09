'use client';

import { useState } from 'react';
import { FaUpload, FaSpinner, FaTrash, FaPlus } from 'react-icons/fa';
import Image from 'next/image';

interface PhotoUploaderProps {
  productId: number;
  currentImage?: string | null;
  currentImages?: string[];
  onImageUpdate: (newImageUrl: string) => void;
  onImagesUpdate?: (newImages: string[]) => void;
}

export default function PhotoUploader({ 
  productId, 
  currentImage, 
  currentImages = [], 
  onImageUpdate, 
  onImagesUpdate 
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [images, setImages] = useState<string[]>(currentImages);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const uploadedImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Проверяем тип файла
        if (!file.type.startsWith('image/')) {
          alert(`Файл ${file.name} не является изображением`);
          continue;
        }

        // Проверяем размер файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`Файл ${file.name} превышает размер 5MB`);
          continue;
        }

        // Создаем FormData для загрузки файла
        const formData = new FormData();
        formData.append('file', file);

        // Загружаем файл через API
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const err = await uploadResponse.json().catch(() => ({}));
          throw new Error(err?.error || `Ошибка загрузки файла ${file.name}`);
        }

        const uploadResult = await uploadResponse.json();
        const imageUrl: string = uploadResult.url || (uploadResult.filename ? `/uploads/${uploadResult.filename}` : '');
        if (!imageUrl) {
          throw new Error('Не удалось получить URL загруженного файла');
        }
        uploadedImages.push(imageUrl);
      }

      if (uploadedImages.length > 0) {
        // Если это первое изображение, устанавливаем как основное
        if (!previewUrl && uploadedImages[0]) {
          setPreviewUrl(uploadedImages[0]);
          onImageUpdate(uploadedImages[0]);
        }

        // Добавляем новые изображения к существующим
        const updatedImages = [...images, ...uploadedImages];
        setImages(updatedImages);
        
        // Обновляем изображения товара в базе данных
        if (onImagesUpdate) {
          onImagesUpdate(updatedImages);
        }

        await updateProductImages(updatedImages, uploadedImages[0]);
      }

    } catch (_error) {
      console.error('Error uploading files:', _error);
      alert(_error instanceof Error ? _error.message : 'Ошибка при загрузке изображений');
    } finally {
      setUploading(false);
      // Очищаем input
      event.target.value = '';
    }
  };

  const updateProductImages = async (newImages: string[], main?: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: newImages,
          image: main || previewUrl || newImages[0] || null
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления изображений');
      }

    } catch (_error) {
      console.error('Error updating product images:', _error);
      alert('Ошибка при обновлении изображений товара');
    }
  };

  const handleDeleteImage = async (imageToDelete: string) => {
    const updatedImages = images.filter(img => img !== imageToDelete);
    setImages(updatedImages);

    // Если удаляемое изображение является основным, выбираем новое основное
    if (imageToDelete === previewUrl) {
      const newMainImage = updatedImages[0] || null;
      setPreviewUrl(newMainImage);
      if (newMainImage) {
        onImageUpdate(newMainImage);
      }
    }

    if (onImagesUpdate) {
      onImagesUpdate(updatedImages);
    }

    await updateProductImages(updatedImages);
  };

  const handleSetMainImage = async (imageUrl: string) => {
    setPreviewUrl(imageUrl);
    onImageUpdate(imageUrl);
    
    await updateProductImages(images, imageUrl);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Изображения товара</h3>
      
      {/* Загрузка новых изображений */}
      <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg">
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center cursor-pointer"
        >
          <div className="text-gray-400 mb-2">
            {uploading ? <FaSpinner className="w-8 h-8 animate-spin" /> : <FaPlus className="w-8 h-8" />}
          </div>
          <span className="text-sm text-gray-600">
            {uploading ? 'Загрузка...' : 'Нажмите для добавления изображений'}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Максимальный размер файла: 5MB
          </span>
        </label>
      </div>

      {/* Основное изображение */}
      {previewUrl && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Основное изображение</h4>
          <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={previewUrl}
              alt="Основное изображение"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Галерея дополнительных изображений */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Галерея изображений ({images.length})
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={`Изображение ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Кнопки управления */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleSetMainImage(imageUrl)}
                      className="p-1 text-white text-xs bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                      title="Сделать основным"
                    >
                      Главное
                    </button>
                    <button
                      onClick={() => handleDeleteImage(imageUrl)}
                      className="p-1 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                      title="Удалить"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Индикатор основного изображения */}
                  {imageUrl === previewUrl && (
                    <div className="absolute top-1 left-1 px-1 py-0.5 bg-blue-500 text-white text-xs rounded">
                      Основное
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && !previewUrl && (
        <div className="text-center py-8 text-gray-500">
          <FaUpload className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Изображения не загружены</p>
          <p className="text-sm">Добавьте изображения для товара</p>
        </div>
      )}
    </div>
  );
}
