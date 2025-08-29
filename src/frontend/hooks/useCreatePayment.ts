import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify'


export interface CreatePaymentDto {
  value: number;
  description: string;
}

export interface PaymentResponse {
  id: string;
  status: string;
  confirmation: {
    confirmation_url: string;
  };

}

// API-функция
const createPayment = async (data: CreatePaymentDto): Promise<PaymentResponse> => {
  const response = await fetch('/api/payment/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при создании платежа');
  }

  return response.json();
};

// Хук
export const useCreatePayment = () => {
  return useMutation<PaymentResponse, Error, CreatePaymentDto>({
    mutationFn: createPayment,
    onSuccess: (data) => {
      if (data.confirmation?.confirmation_url) {
        window.location.href = data.confirmation.confirmation_url;
      }
      toast.success('Платёж создан! Перенаправляем...');
    },
  });
};