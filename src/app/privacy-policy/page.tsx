import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Политика конфиденциальности</h1>
      
      <div className="prose max-w-none">
        <p className="text-gray-600 mb-6">
          Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Общие положения</h2>
          <p className="text-gray-700 mb-4">
            Настоящая Политика конфиденциальности (далее — «Политика») действует в отношении всей информации, 
            которую интернет-магазин «Прованс Декор» может получить о пользователе во время использования им сайта.
          </p>
          <p className="text-gray-700">
            Использование сайта означает безоговорочное согласие пользователя с настоящей Политикой и указанными 
            в ней условиями обработки его персональной информации.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Сбор и использование персональной информации</h2>
          <p className="text-gray-700 mb-4">
            Мы можем собирать следующую персональную информацию:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Имя и фамилия</li>
            <li>Адрес электронной почты</li>
            <li>Номер телефона</li>
            <li>Адрес доставки</li>
            <li>Информация о заказах и покупках</li>
          </ul>
          <p className="text-gray-700">
            Эта информация используется для обработки заказов, связи с клиентами и улучшения качества обслуживания.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Защита персональной информации</h2>
          <p className="text-gray-700 mb-4">
            Мы принимаем все необходимые меры для защиты персональной информации пользователей от несанкционированного 
            доступа, изменения, раскрытия или уничтожения.
          </p>
          <p className="text-gray-700">
            Персональная информация хранится на защищенных серверах с ограниченным доступом.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Cookies и технологии отслеживания</h2>
          <p className="text-gray-700 mb-4">
            Наш сайт использует файлы cookie для улучшения пользовательского опыта, анализа трафика и персонализации контента.
          </p>
          <p className="text-gray-700">
            Вы можете отключить использование cookies в настройках вашего браузера, однако это может повлиять на функциональность сайта.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Права пользователей</h2>
          <p className="text-gray-700 mb-4">
            Пользователи имеют право:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Запросить доступ к своим персональным данным</li>
            <li>Потребовать исправления неточных данных</li>
            <li>Запросить удаление своих персональных данных</li>
            <li>Ограничить обработку персональных данных</li>
            <li>Отозвать согласие на обработку данных</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Изменения в политике</h2>
          <p className="text-gray-700">
            Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. 
            Актуальная версия всегда доступна на нашем сайте.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Контактная информация</h2>
          <p className="text-gray-700 mb-2">
            По вопросам, связанным с обработкой персональных данных, обращайтесь:
          </p>
          <p className="text-gray-700">
            Email: info@provans-decor.ru<br />
            Телефон: 8 (800) 777-18-72
          </p>
        </section>
      </div>
    </div>
  );
}
