'use client';

import { useSession } from 'next-auth/react';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface AdminEditButtonProps {
  productId: string;
  className?: string;
}

export function AdminEditButton({ productId, className = '' }: AdminEditButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();

  // Проверяем, является ли пользователь админом
  const isAdmin = session?.user?.email === 'admin@provans-decor.ru';

  if (!isAdmin) {
    return null;
  }

  const handleEdit = () => {
    router.push(`/admin/products/${productId}/edit`);
  };

  const handleBackToModeration = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/moderation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'back_to_moderation' }),
      });

      if (response.ok) {
        alert('Товар отправлен обратно на модерацию');
        window.location.reload();
      } else {
        alert('Ошибка при отправке товара на модерацию');
      }
    } catch (_error) {
      console.error('Error:', _error);
      alert('Ошибка при отправке товара на модерацию');
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 flex flex-col gap-2 z-50 ${className}`}>
      {/* Кнопка редактирования */}
      <button
        onClick={handleEdit}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        title="Редактировать товар"
      >
        <FaEdit className="w-5 h-5" />
      </button>

      {/* Кнопка возврата на модерацию */}
      <button
        onClick={handleBackToModeration}
        className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        title="Вернуть на модерацию"
      >
        <FaArrowLeft className="w-5 h-5" />
      </button>
    </div>
  );
}
