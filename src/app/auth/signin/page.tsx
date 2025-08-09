'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaEnvelope } from 'react-icons/fa';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    getSession().then((session) => {
      if (session) {
        router.push('/');
      }
    });
  }, [router]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
      });

      if (result?.ok) {
        setMessage('Проверьте свою почту для подтверждения входа!');
      } else {
        setMessage('Ошибка при отправке письма. Попробуйте еще раз.');
      }
    } catch (_error) {
      console.error('Error signing in:', _error);
      setMessage('Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (_error) {
      console.error(`Error signing in with ${provider}:`, _error);
      setMessage('Ошибка при входе. Попробуйте еще раз.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Войти в аккаунт
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Добро пожаловать в Прованс Декор
          </p>
        </div>

        <div className="space-y-4">
          {/* Google Sign In */}
          <button
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaGoogle className="w-5 h-5 mr-3 text-red-500" />
            Войти через Google
          </button>

          {/* Yandex Sign In */}
          <button
            onClick={() => handleOAuthSignIn('yandex')}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="w-5 h-5 mr-3 text-red-600 font-bold">Я</span>
            Войти через Яндекс
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">или</span>
            </div>
          </div>

          {/* Email Sign In */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email адрес
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Введите ваш email"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#E5D3B3] hover:bg-[#D4C2A1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaEnvelope className="w-5 h-5 mr-3" />
              {isLoading ? 'Отправка...' : 'Войти по email'}
            </button>
          </form>

          {message && (
            <div className={`text-center text-sm ${
              message.includes('Проверьте') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-indigo-600 hover:text-indigo-500 text-sm"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
}
