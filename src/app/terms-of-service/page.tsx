import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Условия использования</h1>
      
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-6">
          Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Общие условия</h2>
          <p className="text-gray-700 mb-4">
            Настоящие Условия использования (далее — «Условия») регулируют отношения между интернет-магазином 
            «Прованс Декор» и пользователями сайта.
          </p>
          <p className="text-gray-700">
            Использование сайта означает полное согласие с данными условиями.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Услуги</h2>
          <p className="text-gray-700 mb-4">
            Интернет-магазин «Прованс Декор» предоставляет следующие услуги:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Продажа товаров для дома и декора</li>
            <li>Консультации по выбору товаров</li>
            <li>Доставка товаров</li>
            <li>Послепродажное обслуживание</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Регистрация и аккаунт</h2>
          <p className="text-gray-700 mb-4">
            Для оформления заказов пользователь может зарегистрировать аккаунт на сайте.
          </p>
          <p className="text-gray-700">
            Пользователь обязуется предоставлять достоверную информацию и обеспечивать безопасность своего аккаунта.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Заказы и оплата</h2>
          <p className="text-gray-700 mb-4">
            Заказ считается оформленным после его подтверждения оператором.
          </p>
          <p className="text-gray-700 mb-4">
            Цены на товары могут изменяться без предварительного уведомления.
          </p>
          <p className="text-gray-700">
            Оплата производится способами, указанными на сайте.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Доставка</h2>
          <p className="text-gray-700 mb-4">
            Доставка осуществляется в пределах территории Российской Федерации.
          </p>
          <p className="text-gray-700">
            Сроки и стоимость доставки указываются при оформлении заказа.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Возврат и обмен</h2>
          <p className="text-gray-700 mb-4">
            Возврат и обмен товаров осуществляется в соответствии с действующим законодательством РФ.
          </p>
          <p className="text-gray-700">
            Товар должен быть в оригинальной упаковке и сохранять товарный вид.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Ограничение ответственности</h2>
          <p className="text-gray-700">
            Интернет-магазин не несет ответственности за ущерб, возникший в результате неправильного использования товаров.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Контактная информация</h2>
          <p className="text-gray-700 mb-2">
            По всем вопросам обращайтесь:
          </p>
          <p className="text-gray-700">
            Email: info@provans-decor.ru<br />
            Телефон: 8 (800) 777-18-72<br />
            Время работы: с 09:00 до 21:00
          </p>
        </section>
      </div>
    </div>
  );
}
