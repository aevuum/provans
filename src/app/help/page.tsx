import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Помощь и поддержка | Provans Decor',
  description: 'Центр помощи Provans Decor. Ответы на вопросы, инструкции по заказу, доставке и оплате.',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Помощь и поддержка
          </h1>
          <p className="text-xl text-gray-600">
            Найдите ответы на самые популярные вопросы
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Быстрые ссылки */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-[#E5D3B3] rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                🛒
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Оформление заказа</h3>
              <p className="text-gray-600 text-sm">Пошаговая инструкция по размещению заказа</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-[#E5D3B3] rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                🚚
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Доставка</h3>
              <p className="text-gray-600 text-sm">Все о сроках, стоимости и способах доставки</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-[#E5D3B3] rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                💳
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Оплата</h3>
              <p className="text-gray-600 text-sm">Доступные способы оплаты и безопасность</p>
            </div>
          </div>

          {/* Основные разделы FAQ */}
          <div className="space-y-8">
            {/* Заказы */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-3">📦</span>
                Заказы
              </h2>
              <div className="space-y-4">
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Как оформить заказ?
                  </summary>
                  <div className="text-gray-600 text-sm mt-2 pl-4">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Выберите товары и добавьте их в корзину</li>
                      <li>Перейдите в корзину и нажмите &ldquo;Оформить заказ&rdquo;</li>
                      <li>Заполните контактные данные</li>
                      <li>Выберите способ доставки и оплаты</li>
                      <li>Подтвердите заказ</li>
                    </ol>
                  </div>
                </details>
                
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Можно ли изменить или отменить заказ?
                  </summary>
                  <p className="text-gray-600 text-sm mt-2 pl-4">
                    Изменить или отменить заказ можно в течение 1 часа после оформления, 
                    пока он не передан в обработку. Свяжитесь с нами по телефону 8 (800) 777-18-72.
                  </p>
                </details>
                
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Как отследить статус заказа?
                  </summary>
                  <p className="text-gray-600 text-sm mt-2 pl-4">
                    После оформления заказа вы получите номер для отслеживания. 
                    Проверить статус можно в личном кабинете или по телефону горячей линии.
                  </p>
                </details>
                
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Сколько времени обрабатывается заказ?
                  </summary>
                  <p className="text-gray-600 text-sm mt-2 pl-4">
                    Обработка заказа занимает от 2 до 24 часов в рабочие дни. 
                    После обработки заказ передается в службу доставки.
                  </p>
                </details>
              </div>
            </div>

            {/* Доставка */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-3">🚚</span>
                Доставка
              </h2>
              <div className="space-y-4">
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Какие способы доставки доступны?
                  </summary>
                  <div className="text-gray-600 text-sm mt-2 pl-4">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Курьерская доставка по Владимиру</li>
                      <li>Доставка транспортными компаниями по России</li>
                      <li>Почта России для небольших товаров</li>
                      <li>Самовывоз из пунктов выдачи во Владимире</li>
                    </ul>
                  </div>
                </details>
                
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Сколько стоит доставка?
                  </summary>
                  <div className="text-gray-600 text-sm mt-2 pl-4">
                    <ul className="list-disc list-inside space-y-1">
                      <li>По Владимиру — 350 ₽</li>
                      <li>По России — от 300 ₽ (зависит от региона и веса)</li>
                      <li>Самовывоз — бесплатно</li>
                    </ul>
                  </div>
                </details>
                
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Сколько времени занимает доставка?
                  </summary>
                  <div className="text-gray-600 text-sm mt-2 pl-4">
                    <ul className="list-disc list-inside space-y-1">
                      <li>По Владимиру — 1-2 рабочих дня</li>
                      <li>По России — 3-7 рабочих дней (в зависимости от региона)</li>
                    </ul>
                  </div>
                </details>
                
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Что делать, если товар поврежден при доставке?
                  </summary>
                  <p className="text-gray-600 text-sm mt-2 pl-4">
                    Обязательно проверьте товар при получении. Если обнаружили повреждения, 
                    отметьте это в документах курьера и свяжитесь с нами в течение 24 часов. 
                    Мы заменим поврежденный товар за свой счет.
                  </p>
                </details>
              </div>
            </div>

            {/* Оплата */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-3">💳</span>
                Оплата
              </h2>
              <div className="space-y-4">
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Какие способы оплаты доступны?
                  </summary>
                  <div className="text-gray-600 text-sm mt-2 pl-4">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Банковские карты Visa, MasterCard, МИР</li>
                      <li>Оплата наличными при получении</li>
                      <li>Банковский перевод для юридических лиц</li>
                      <li>Электронные кошельки (Qiwi, ЮMoney)</li>
                    </ul>
                  </div>
                </details>
                
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Безопасна ли оплата картой?
                  </summary>
                  <p className="text-gray-600 text-sm mt-2 pl-4">
                    Да, все платежи защищены протоколом SSL и проходят через сертифицированные 
                    платежные системы. Мы не храним данные ваших карт на наших серверах.
                  </p>
                </details>
                
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Когда списываются деньги с карты?
                  </summary>
                  <p className="text-gray-600 text-sm mt-2 pl-4">
                    При онлайн-оплате деньги списываются сразу после подтверждения заказа. 
                    При оплате наличными — в момент получения товара.
                  </p>
                </details>
                
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Можно ли вернуть деньги?
                  </summary>
                  <p className="text-gray-600 text-sm mt-2 pl-4">
                    Да, при возврате товара деньги возвращаются тем же способом, 
                    которым была произведена оплата, в течение 7-14 рабочих дней.
                  </p>
                </details>
              </div>
            </div>

            {/* Возврат и обмен */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-3">↩️</span>
                Возврат и обмен
              </h2>
              <div className="space-y-4">
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    В течение какого времени можно вернуть товар?
                  </summary>
                  <p className="text-gray-600 text-sm mt-2 pl-4">
                    Товар можно вернуть в течение 14 дней с момента получения, 
                    если он не подошел по размеру, цвету или другим характеристикам.
                  </p>
                </details>
                
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Какие условия для возврата?
                  </summary>
                  <div className="text-gray-600 text-sm mt-2 pl-4">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Товар не был в использовании</li>
                      <li>Сохранена оригинальная упаковка</li>
                      <li>Есть все комплектующие и документы</li>
                      <li>Товарный вид не нарушен</li>
                    </ul>
                  </div>
                </details>
                
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Как оформить возврат?
                  </summary>
                  <div className="text-gray-600 text-sm mt-2 pl-4">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Свяжитесь с нами по телефону или email</li>
                      <li>Опишите причину возврата</li>
                      <li>Получите номер возврата</li>
                      <li>Упакуйте товар в оригинальную упаковку</li>
                      <li>Передайте курьеру или отправьте почтой</li>
                    </ol>
                  </div>
                </details>
                
                <details className="border-b border-gray-200 pb-4">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-[#7C5C27] py-2">
                    Кто оплачивает доставку при возврате?
                  </summary>
                  <p className="text-gray-600 text-sm mt-2 pl-4">
                    Если товар не подошел или не понравился — доставку оплачивает покупатель. 
                    Если товар с браком или не соответствует описанию — доставку оплачиваем мы.
                  </p>
                </details>
              </div>
            </div>
          </div>

          {/* Контакты поддержки */}
          <div className="bg-[#7C5C27] text-white rounded-lg p-8 mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Не нашли ответ на свой вопрос?</h2>
            <p className="mb-6">Наша служба поддержки готова помочь вам</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:88007771872" 
                className="bg-white text-[#7C5C27] px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                📞 8 (800) 777-18-72
              </a>
              <a 
                href="mailto:info@provans.ru" 
                className="bg-white text-[#7C5C27] px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                ✉️ info@provans.ru
              </a>
            </div>
            <p className="text-sm mt-4 opacity-90">Работаем ежедневно с 9:00 до 21:00 (по Владимирскому времени)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
