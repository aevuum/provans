'use client';

import { useRouter } from 'next/navigation';

export default function VerifyRequest() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-6xl mb-6">📧</div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Проверьте свою почту
          </h2>
          <p className="text-gray-600 mb-8">
            Мы отправили вам ссылку для входа на email адрес. 
            Перейдите по ссылке в письме, чтобы войти в аккаунт.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#E5D3B3] hover:bg-[#D4C2A1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Вернуться к входу
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
