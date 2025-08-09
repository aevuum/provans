'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { clearCart } from '@/lib/features/cart/cartSlice';
import { addNotification } from '@/lib/features/notifications/notificationSlice';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentId, setPaymentId] = useState('');

  const checkPaymentStatus = useCallback(async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/create?paymentId=${paymentId}`);
      const result = await response.json();

      if (result.success && result.payment.status === 'succeeded') {
        setStatus('success');
        dispatch(clearCart());
        dispatch(addNotification({
          type: 'success',
          message: `Заказ №${orderNumber} успешно оплачен!`
        }));
      } else {
        setStatus('error');
        dispatch(addNotification({
          type: 'error',
          message: 'Не удалось подтвердить платеж'
        }));
      }
    } catch (_error) {
      console.error('Payment status check error:', _error);
      setStatus('error');
      dispatch(addNotification({
        type: 'error',
        message: 'Ошибка при проверке статуса платежа'
      }));
    }
  }, [orderNumber, dispatch]);

  useEffect(() => {
    const orderParam = searchParams.get('order');
    const paymentIdParam = searchParams.get('payment_id');
    const mockParam = searchParams.get('mock');

    if (!orderParam) {
      setStatus('error');
      return;
    }

    setOrderNumber(orderParam);
    
    if (paymentIdParam) {
      setPaymentId(paymentIdParam);
      // Проверяем статус платежа
      checkPaymentStatus(paymentIdParam);
    } else if (mockParam === 'true') {
      // Для демо режима
      setTimeout(() => {
        setStatus('success');
        dispatch(clearCart());
        dispatch(addNotification({
          type: 'success',
          message: `Заказ №${orderParam} успешно оплачен!`
        }));
      }, 2000);
    } else {
      // Заказ без онлайн оплаты
      setStatus('success');
      dispatch(clearCart());
    }
  }, [searchParams, dispatch, checkPaymentStatus]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <FaSpinner className="text-4xl text-blue-500 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Обработка платежа...
          </h1>
          <p className="text-gray-600">
            Пожалуйста, подождите, мы проверяем статус вашего платежа.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <FaTimesCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Ошибка обработки заказа
          </h1>
          <p className="text-gray-600 mb-6">
            Возникла проблема при обработке вашего заказа или платежа. 
            Пожалуйста, свяжитесь с нами для уточнения статуса.
          </p>
          <div className="flex flex-col space-y-3">
            <Link
              href="/cart"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться к корзине
            </Link>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              На главную страницу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Спасибо за заказ!
        </h1>
        <p className="text-gray-600 mb-2">
          Ваш заказ <strong>№{orderNumber}</strong> успешно оформлен
          {paymentId && ' и оплачен'}.
        </p>
        <p className="text-gray-600 mb-6">
          Мы отправили подтверждение на указанный email адрес. 
          В ближайшее время с вами свяжется наш менеджер для уточнения деталей доставки.
        </p>
        
        {paymentId && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">
              <strong>ID платежа:</strong> {paymentId}
            </p>
          </div>
        )}
        
        <div className="flex flex-col space-y-3">
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Продолжить покупки
          </Link>
          <Link
            href="/catalog"
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            Перейти к каталогу
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Проверяем статус платежа...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
