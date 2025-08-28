'use client';

import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ open, onClose }: Props) {
  const [email, setEmail] = useState('');

  if (!open) return null;

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <FaTimes className="w-6 h-6" />
        </button>
        <h2 className="text-4xl font-bold mb-6 text-center">Восстановление пароля</h2>
        <div className="text-gray-500 text-center mb-8 text-lg">
          Если вы забыли пароль, введите логин.
        </div>
        <form
          className="space-y-6"
          onSubmit={e => {
            e.preventDefault();
            // TODO: отправить запрос на восстановление пароля
            onClose();
          }}
        >
          <div>
            <label className="block mb-1 font-medium text-lg">
              Логин или email: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full rounded-lg border px-4 py-4 bg-gray-50 text-lg"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <div className="text-gray-400 text-base mt-2">
              Контрольная строка для смены пароля, а также ваши регистрационные данные, будут высланы вам по E-Mail.
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-bold text-lg mt-4"
          >
            ВОССТАНОВИТЬ
          </button>
          <div className="text-xs text-gray-400 text-center mt-2">
            <span className="text-red-500">*</span> – обязательные поля
          </div>
        </form>
      </div>
    </div>
  );
}