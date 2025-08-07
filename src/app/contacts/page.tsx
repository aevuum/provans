import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Контакты | Provans Decor',
  description: 'Контактная информация Provans Decor. Телефон, email, адрес и время работы.',
};

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Контакты
          </h1>
          <p className="text-xl text-gray-600">
            Мы всегда рады помочь вам с выбором и ответить на любые вопросы
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Контактная информация */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-8 h-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Как с нами связаться</h2>
                
                <div className="space-y-6">
                  {/* Телефон */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#E5D3B3] rounded-lg flex items-center justify-center text-xl">
                      📞
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Телефон</h3>
                      <p className="text-gray-600 mb-1">
                        <a href="tel:88007771872" className="text-[#7C5C27] hover:underline text-lg font-medium">
                          8 (800) 777-18-72
                        </a>
                      </p>
                      <p className="text-sm text-gray-500">Бесплатный звонок по России</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#E5D3B3] rounded-lg flex items-center justify-center text-xl">
                      ✉️
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600 mb-1">
                        <a href="mailto:info@provans.ru" className="text-[#7C5C27] hover:underline">
                          info@provans.ru
                        </a>
                      </p>
                      <p className="text-sm text-gray-500">Ответим в течение 24 часов</p>
                    </div>
                  </div>

                  {/* Время работы */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#E5D3B3] rounded-lg flex items-center justify-center text-xl">
                      🕒
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Время работы</h3>
                      <p className="text-gray-600 mb-1">Ежедневно с 9:00 до 21:00</p>
                      <p className="text-sm text-gray-500">Московское время</p>
                    </div>
                  </div>

                  {/* Социальные сети */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#E5D3B3] rounded-lg flex items-center justify-center text-xl">
                      📱
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Социальные сети</h3>
                      <div className="flex space-x-4">
                        <a href="https://vk.com" target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:text-blue-800 transition-colors">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.131-.427.131-.427s-.019-1.307.587-1.5c.597-.19 1.363.263 2.177.988.615.549 1.081.428 1.081.428l2.174-.03s1.138-.07.599-1.096c-.044-.085-.312-.66-1.607-1.867-1.357-1.264-1.175-1.059.459-3.247.994-1.332 1.392-2.145 1.268-2.492-.118-.331-.842-.244-.842-.244l-2.448.015s-.181-.025-.315.056-.218.185-.218.185-.39 1.038-.909 1.922c-1.094 1.866-1.531 1.965-1.708 1.849-.41-.267-.308-1.072-.308-1.643 0-1.786.27-2.53-.527-2.724-.264-.064-.459-.107-1.135-.114-.867-.009-1.6.003-2.014.206-.276.135-.489.436-.359.453.161.021.525.098.718.36.249.338.24 1.091.24 1.091s.143 2.1-.334 2.36c-.328.18-.778-.187-1.744-1.86-.495-.855-.87-1.8-.87-1.8s-.072-.177-.2-.272c-.155-.115-.372-.151-.372-.151l-2.328.015s-.349.01-.477.161c-.114.135-.009.413-.009.413s1.832 4.28 3.906 6.44c1.901 1.981 4.058 1.85 4.058 1.85z"/>
                          </svg>
                        </a>
                        <a href="https://t.me/provans_decor" target="_blank" rel="noopener noreferrer"
                           className="text-blue-500 hover:text-blue-700 transition-colors">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.59c-.12.539-.437.67-.887.417l-2.456-1.81-1.184 1.14c-.131.131-.241.241-.495.241l.176-2.497 4.552-4.115c.197-.176-.043-.275-.306-.099L9.73 13.79l-2.42-.758c-.526-.164-.537-.526.11-.78L19.616 7.2c.438-.164.821.099.68.76z"/>
                          </svg>
                        </a>
                        <a href="https://instagram.com/provans.decor" target="_blank" rel="noopener noreferrer"
                           className="text-pink-500 hover:text-pink-700 transition-colors">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Карта и дополнительная информация */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-8 h-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Дополнительная информация</h2>
                
                <div className="space-y-6">
                  {/* Доставка */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="text-xl mr-2">🚚</span>
                      Доставка
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Осуществляем доставку по всей России. Москва и МО — 1-2 дня, 
                      регионы — 3-7 дней. Бесплатная доставка от 5000 ₽.
                    </p>
                  </div>

                  {/* Оплата */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="text-xl mr-2">💳</span>
                      Способы оплаты
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Принимаем к оплате банковские карты Visa, MasterCard, МИР, 
                      а также оплату наличными при получении.
                    </p>
                  </div>

                  {/* Возврат */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="text-xl mr-2">↩️</span>
                      Возврат и обмен
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Возврат товара в течение 14 дней с момента получения. 
                      Товар должен быть в оригинальной упаковке.
                    </p>
                  </div>

                  {/* Гарантия */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="text-xl mr-2">🛡️</span>
                      Гарантия качества
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Все товары проходят тщательный контроль качества. 
                      Предоставляем гарантию на все изделия согласно их типу.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Форма обратной связи - полная ширина */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Напишите нам</h2>
            <div className="max-w-2xl mx-auto">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E5D3B3]"
                      placeholder="Введите ваше имя"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E5D3B3]"
                      placeholder="Введите ваш email"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Тема
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E5D3B3]"
                    placeholder="Тема сообщения"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Сообщение
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E5D3B3]"
                    placeholder="Введите ваше сообщение"
                  ></textarea>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#7C5C27] text-white rounded-md hover:bg-[#6B4D1F] transition-colors font-medium"
                  >
                    Отправить сообщение
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
