'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function RegisterPage() {
  const [agree, setAgree] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-4">Регистрация</h1>
      <p className="text-center text-gray-500 mb-8">
        Зарегистрируйтесь, чтобы использовать все возможности личного кабинета: отслеживание заказов, настройку подписки, связь с социальными сетями и другие. Мы никогда и ни при каких условиях не разглашаем личные данные клиентов. Контактная информация будет использована только для оформления заказов и более удобной работы с сайтом.
      </p>
      <form className="space-y-6">
        <div>
          <label className="block mb-1 font-medium">Имя <span className="text-red-500">*</span></label>
          <input type="text" required className="w-full rounded-lg border px-4 py-2 bg-gray-50" />
        </div>
        <div>
          <label className="block mb-1 font-medium">E-mail <span className="text-red-500">*</span></label>
          <input type="email" required className="w-full rounded-lg border px-4 py-2 bg-gray-50" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Телефон</label>
          <input type="tel" placeholder="+7 (___) ___-__-__" className="w-full rounded-lg border px-4 py-2 bg-gray-50" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Пароль <span className="text-red-500">*</span></label>
          <input type="password" required minLength={6} className="w-full rounded-lg border px-4 py-2 bg-gray-50" />
          <div className="text-xs text-gray-400 mt-1">Длина пароля не менее 6 символов.</div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Подтверждение пароля <span className="text-red-500">*</span></label>
          <input type="password" required minLength={6} className="w-full rounded-lg border px-4 py-2 bg-gray-50" />
        </div>
        <div className="flex items-center mt-4">
          <button
            type="button"
            onClick={() => setAgree(!agree)}
            className={`w-10 h-6 rounded-full mr-3 transition-all duration-200 ${agree ? 'bg-black' : 'bg-gray-300'}`}
            style={{ boxShadow: agree ? '0 2px 8px #0002' : undefined }}
          >
            <span className={`block w-5 h-5 rounded-full bg-white shadow transform transition-all duration-200 ${agree ? 'translate-x-4' : ''}`}></span>
          </button>
          <span className="text-gray-500 text-base">
            Я согласен на <Link href="/privacy-policy" className="underline text-black">обработку персональных данных</Link> и <Link href="/privacy-policy" className="underline text-black">договор оферты</Link>.
          </span>
        </div>
        <button
          type="submit"
          disabled={!agree}
          className="w-full bg-[#B8835A] text-white py-3 rounded-lg font-bold text-lg mt-4 disabled:opacity-50"
        >
          ЗАРЕГИСТРИРОВАТЬСЯ
        </button>
        <div className="text-xs text-gray-400 text-center mt-2">
          <span className="text-red-500">*</span> — обязательные поля
        </div>
      </form>
    </div>
  )
}