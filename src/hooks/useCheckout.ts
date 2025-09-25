// hooks/useCheckout.ts
import { useState } from 'react';
import { useAppDispatch } from '../lib/hooks';
import { useCreatePayment } from './useCreatePayment';
import { clearCart } from '../lib/features/cart/cartSlice';
import { addNotification } from '../lib/features/notifications/notificationSlice';


export const useCheckout = () => {
  const dispatch = useAppDispatch();
  const { mutate: createPayment, isPending } = useCreatePayment();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Обязательное поле';
    if (!formData.lastName.trim()) newErrors.lastName = 'Обязательное поле';
    if (!formData.email.trim()) {
      newErrors.email = 'Обязательное поле';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Обязательное поле';
    } else if (!/^[+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Неверный формат телефона';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const startPayment = (cartItems: Array<{ id: string; title: string; price: number; count?: number }>) => {
    if (!validate()) return;

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.count || 1), 0);
    const total = subtotal + 350;

    const description = cartItems.map(item => item.title).join(', ');

    createPayment(
      {
        value: total,
        description,
      },
      {
        onSuccess: () => {
          dispatch(clearCart());
        },
        onError: () => {
          dispatch(
            addNotification({
              type: 'error',
              message: 'Ошибка при создании платежа',
            })
          );
        },
      }
    );
  };

  return {
    formData,
    errors,
    isPending,
    handleChange,
    startPayment,
  };
};