'use client';

import React, { useState } from 'react';
import { FaCreditCard, FaMoneyBillWave, FaMobileAlt, FaShieldAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';

export type PaymentMethod = 'card' | 'yoomoney' | 'sberbank' | 'qiwi';

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: React.ReactNode;
  description: string;
  fee?: string;
  popular?: boolean;
}

interface PaymentFormProps {
  totalAmount: number;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  onPaymentSubmit: (method: PaymentMethod, data: Record<string, unknown>) => Promise<void>;
  isProcessing?: boolean;
  className?: string;
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'card',
    name: 'Банковская карта',
    icon: <FaCreditCard className="w-6 h-6" />,
    description: 'Visa, MasterCard, МИР',
    popular: true
  },
  {
    id: 'yoomoney',
    name: 'ЮMoney',
    icon: <FaMoneyBillWave className="w-6 h-6" />,
    description: 'Яндекс.Деньги, кошелек'
  },
  {
    id: 'sberbank',
    name: 'Сбербанк Онлайн',
    icon: <FaMoneyBillWave className="w-6 h-6" />,
    description: 'Через мобильное приложение'
  },
  {
    id: 'qiwi',
    name: 'QIWI Кошелек',
    icon: <FaMobileAlt className="w-6 h-6" />,
    description: 'Электронный кошелек'
  }
];

export function PaymentForm({
  totalAmount,
  onPaymentMethodSelect,
  onPaymentSubmit,
  isProcessing = false,
  className = ''
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    holder: ''
  });

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    onPaymentMethodSelect(method);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentData = selectedMethod === 'card' ? cardData : {};
    await onPaymentSubmit(selectedMethod, paymentData);
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim()
      .substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substring(0, 5);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Заголовок */}
      <div className="flex items-center gap-3 mb-6">
        <FaShieldAlt className="w-6 h-6 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-800">Способ оплаты</h2>
      </div>

      {/* Сумма к оплате */}
      <div className="bg-[#E5D3B3] rounded-lg p-4 mb-6">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">К оплате:</div>
          <div className="text-3xl font-bold text-[#7C5C27]">
            {totalAmount.toLocaleString('ru-RU')} ₽
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Выбор способа оплаты */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Выберите способ оплаты:</h3>
          <div className="grid gap-3">
            {paymentOptions.map((option) => (
              <label
                key={option.id}
                className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedMethod === option.id
                    ? 'border-[#E5D3B3] bg-[#E5D3B3]/10'
                    : 'border-gray-200 hover:border-[#E5D3B3]/50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.id}
                  checked={selectedMethod === option.id}
                  onChange={() => handleMethodSelect(option.id)}
                  className="sr-only"
                />
                
                {/* Популярный значок */}
                {option.popular && (
                  <div className="absolute -top-2 -right-2 bg-[#7C5C27] text-white text-xs px-2 py-1 rounded-full">
                    Популярный
                  </div>
                )}

                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${
                    selectedMethod === option.id ? 'bg-[#E5D3B3] text-[#7C5C27]' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{option.name}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                    {option.fee && (
                      <div className="text-xs text-orange-600 mt-1">{option.fee}</div>
                    )}
                  </div>

                  <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                    selectedMethod === option.id
                      ? 'border-[#7C5C27] bg-[#7C5C27]'
                      : 'border-gray-300'
                  }`}>
                    {selectedMethod === option.id && (
                      <FaCheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Форма для банковской карты */}
        {selectedMethod === 'card' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-4">Данные банковской карты:</h4>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер карты
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.number}
                  onChange={(e) => setCardData(prev => ({
                    ...prev,
                    number: formatCardNumber(e.target.value)
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Срок действия
                  </label>
                  <input
                    type="text"
                    placeholder="ММ/ГГ"
                    value={cardData.expiry}
                    onChange={(e) => setCardData(prev => ({
                      ...prev,
                      expiry: formatExpiry(e.target.value)
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength={3}
                    value={cardData.cvv}
                    onChange={(e) => setCardData(prev => ({
                      ...prev,
                      cvv: e.target.value.replace(/\D/g, '')
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя держателя карты
                </label>
                <input
                  type="text"
                  placeholder="IVAN IVANOV"
                  value={cardData.holder}
                  onChange={(e) => setCardData(prev => ({
                    ...prev,
                    holder: e.target.value.toUpperCase()
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5D3B3] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Защита данных */}
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg mb-6">
          <FaShieldAlt className="w-5 h-5 text-green-600" />
          <div className="text-sm text-green-800">
            <div className="font-medium">Безопасная оплата</div>
            <div>Ваши данные защищены SSL-шифрованием</div>
          </div>
        </div>

        {/* Кнопка оплаты */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-[#7C5C27] hover:bg-[#6B4E23] disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <FaSpinner className="w-5 h-5 animate-spin" />
              Обработка платежа...
            </>
          ) : (
            <>
              Оплатить {totalAmount.toLocaleString('ru-RU')} ₽
            </>
          )}
        </button>
      </form>

      {/* Дополнительная информация */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        Нажимая кнопку &quot;Оплатить&quot;, вы соглашаетесь с{' '}
        <a href="/privacy-policy" className="text-[#7C5C27] hover:underline">
          условиями обработки персональных данных
        </a>
      </div>
    </div>
  );
}
