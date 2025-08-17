import React, { useState, useCallback, useMemo } from 'react';
import { SafeImage } from './SafeImage';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  productTitle: string;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = React.memo(({ 
  images, 
  productTitle, 
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Мемоизируем массив изображений
  const imageList = useMemo(() => images.filter(Boolean), [images]);

  const handlePrevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  }, [imageList.length]);

  const handleNextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  }, [imageList.length]);

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const toggleZoom = useCallback(() => {
    setIsZoomed(prev => !prev);
  }, []);

  const openFullscreen = useCallback(() => {
    setShowFullscreen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeFullscreen = useCallback(() => {
    setShowFullscreen(false);
    document.body.style.overflow = 'auto';
    setIsZoomed(false);
  }, []);

  // Обработка клавиш
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!showFullscreen) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          handlePrevImage();
          break;
        case 'ArrowRight':
          handleNextImage();
          break;
        case 'Escape':
          closeFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showFullscreen, handlePrevImage, handleNextImage, closeFullscreen]);

  if (!imageList.length) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-sm">Изображения не найдены</div>
      </div>
    );
  }

  const currentImage = imageList[currentIndex];

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Основное изображение */}
        <div className="relative group">
          <SafeImage
            src={currentImage}
            alt={`${productTitle} - изображение ${currentIndex + 1}`}
            className="w-full h-full object-cover rounded-lg cursor-zoom-in"
            onClick={openFullscreen}
          />
          
          {/* Навигация по изображениям */}
          {imageList.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label="Предыдущее изображение"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label="Следующее изображение"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}
          
          {/* Индикатор изображения */}
          {imageList.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {currentIndex + 1} / {imageList.length}
            </div>
          )}
          
          {/* Кнопка увеличения */}
          <button
            onClick={openFullscreen}
            className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Увеличить изображение"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Миниатюры */}
        {imageList.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {imageList.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`flex-shrink-0 relative ${
                  index === currentIndex
                    ? 'ring-2 ring-blue-500 ring-offset-2'
                    : 'hover:opacity-80'
                } transition-all duration-200`}
                aria-label={`Показать изображение ${index + 1}`}
              >
                <SafeImage
                  src={image}
                  alt={`Миниатюра ${index + 1}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Полноэкранный просмотр */}
      {showFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 modal-backdrop flex items-center justify-center p-4">
          {/* Управление */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={toggleZoom}
              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors duration-200"
              aria-label={isZoomed ? "Уменьшить" : "Увеличить"}
            >
              {isZoomed ? <ZoomOut className="w-6 h-6" /> : <ZoomIn className="w-6 h-6" />}
            </button>
            <button
              onClick={closeFullscreen}
              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors duration-200"
              aria-label="Закрыть"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Навигация в полноэкранном режиме */}
          {imageList.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors duration-200"
                aria-label="Предыдущее изображение"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors duration-200"
                aria-label="Следующее изображение"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Изображение в полноэкранном режиме */}
          <div 
            className={`max-w-full max-h-full transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={toggleZoom}
          >
            <SafeImage
              src={currentImage}
              alt={`${productTitle} - полноэкранный просмотр`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Индикатор в полноэкранном режиме */}
          {imageList.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg">
              {currentIndex + 1} / {imageList.length}
            </div>
          )}
        </div>
      )}
    </>
  );
});

ImageGallery.displayName = 'ImageGallery';

export { ImageGallery };
