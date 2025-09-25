import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Помощь и поддержка | Provance Decor',
  description: 'Центр помощи Provance Decor. Ответы на вопросы, инструкции по заказу, доставке и оплате.',
};

export default function HelpPage() {
  return (
    <main className="font-sans home-hero-shadow site-fabric-bg min-h-screen">
  <div className="w-full px-5 py-12">
        {/* Заголовок */}
          <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Помощь и поддержка
          </h1>
          <p className="text-2xl text-gray-600">
            Найдите ответы на самые популярные вопросы
          </p>
        </div>

          <div className="w-full">

          {/* Основные разделы FAQ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
            {/* Доставка, Оплата и Поддержка — в одну колонку */}
            <div className="flex flex-col space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6 w-full">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="text-3xl mr-3">🚚</span>
                  Доставка
                </h2>
                <div className="text-gray-700 text-lg leading-relaxed">
                  <p className="mb-4">Мы осуществляем доставку по всей России, бережно упаковывая даже самые хрупкие грузы! Вы можете не переживать за заказанные товары.</p>
                  <p className="mb-4">От вас главное — указать верные данные для отправки: ФИО получателя, контактный телефон, удобный адрес пункта выдачи (СДЭК) или почтовый индекс для получения Почтой России.</p>

                  <p className="font-medium mt-4">Доставка осуществляется:</p>
                  <ul className="list-disc list-inside mt-2 mb-4">
                    <li>📦 СДЭК — доставка по РФ</li>
                    <li>📦 Почта России</li>
                  </ul>

                  <p className="mt-2">Если товар поврежден при получении — обязательно отметьте это в документах при получении и свяжитесь с нами в течение 24 часов; мы поможем с возвратом или заменой.</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 w-full">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="text-3xl mr-3">💳</span>
                  Оплата
                </h2>
                <div className="text-gray-700 text-lg leading-relaxed">
                  <p className="mb-4">Онлайн‑оплата проходит через ЮKassa (Юкасса) — все реквизиты и способы оплаты отображаются на странице оплаты. Также возможна оплата картой, через электронные кошельки и банковский перевод для юр. лиц.</p>
                  <p className="mb-2">При необходимости наличной оплаты — уточняйте условия при оформлении (некоторые способы доставки поддерживают оплату при получении).</p>
                  <p className="text-base text-gray-600 mt-2">Все платежи защищены и проходят через сертифицированные платёжные системы; мы не храним данные карт на наших серверах.</p>
                </div>
              </div>
              <div className="bg-[#7C5C27] text-white rounded-lg p-6 text-center w-full">
                <h2 className="text-3xl font-bold mb-4">Не нашли ответ на свой вопрос?</h2>
                <p className="mb-6">Наша служба поддержки готова помочь вам</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="tel:88007771872" 
                    className="bg-white text-[#7C5C27] px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors text-lg"
                  >
                    📞 8 (800) 777-18-72
                  </a>
                  <a 
                    href="mailto:info@provance.ru" 
                    className="bg-white text-[#7C5C27] px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors text-lg"
                  >
                    ✉️ info@provance.ru
                  </a>
                </div>
                <p className="text-base mt-4 opacity-90 text-center">Работаем ежедневно с 10:00 до 21:00</p>
              </div>
            </div>

            {/* Возврат и обмен */}
            <div className="bg-white rounded-lg shadow-sm p-6 w-full">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">↩️</span>
                Возврат и обмен
              </h2>
              <div className="text-gray-700 text-lg leading-relaxed space-y-4">
                  <p>Если вы по какой‑то причине решили вернуть или обменять товар, мы поможем в рамках законодательства РФ (Закон «О защите прав потребителей»). Ниже — краткая, понятная инструкция, сохраняющая все юридические положения.</p>

                  <h3 className="font-medium">Возврат товара надлежащего качества</h3>
                  <ol className="list-decimal list-inside pl-4 space-y-2">
                    <li>Вы можете отказаться от заказа до его получения, а после получения — в течение 7 дней (не считая дня покупки).</li>
                    <li>Товар подлежит возврату, если сохранены его товарный вид, потребительские свойства и есть документ о покупке (чек, счёт и т.д.).</li>
                    <li>При возврате надлежащего товара продавец возвращает уплаченную сумму за вычетом возможных расходов на обратную доставку; возврат средств осуществляется не позднее 10 дней со дня предъявления требования покупателем.</li>
                  </ol>

                  <h3 className="font-medium">Возврат товара ненадлежащего качества</h3>
                  <p>Если товар имеет существенный недостаток (дефект, брак), вы вправе по выбору потребовать одно из следующих:</p>
                  <ul className="list-disc list-inside pl-4 space-y-2">
                    <li>замену на такой же товар или на товар другой марки с перерасчётом цены;</li>
                    <li>соразмерное уменьшение покупной цены;</li>
                    <li>бесплатное устранение недостатков или компенсацию расходов на их исправление;</li>
                    <li>отказ от исполнения договора и возврат уплаченной суммы.</li>
                  </ul>

                  <p>Для технически сложных товаров действуют специальные правила (см. Постановление Правительства РФ от 10.11.2011 № 924).</p>

                  <p>Сроки предъявления претензий: в пределах гарантийного срока — в течение гарантийного срока; при отсутствии гарантии — в разумный срок, но не более 2 лет.</p>

                  <p>Мы можем отказать в возврате или обмене, если повреждение товара возникло по вине покупателя. В случае спора интернет‑магазин может инициировать независимую экспертизу; если экспертиза покажет, что недостатки вызваны неправильной эксплуатацией, покупатель возмещает её стоимость и связанные расходы.</p>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </main>
  );
}
