import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'О компании | Provans Decor',
  description: 'История компании Provans Decor. Мы создаем уникальный декор для вашего дома с 2010 года.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            О компании Provans Decor
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Мы создаем уникальную атмосферу уюта и красоты в вашем доме уже более 14 лет
          </p>
        </div>

        {/* Основной контент */}
        <div className="max-w-4xl mx-auto">
          {/* История компании */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Наша история</h2>
              <div className="prose prose-lg text-gray-700">
                <p className="mb-4">
                  Компания <strong>Provans Decor</strong> была основана в 2010 году с простой, но важной миссией — 
                  помочь людям создавать красивые и уютные дома. Мы верим, что каждый дом должен отражать 
                  личность своих обитателей и дарить радость каждый день.
                </p>
                <p className="mb-4">
                  За годы работы мы стали одним из ведущих поставщиков декоративных товаров и аксессуаров 
                  для дома в России. Наша команда состоит из опытных дизайнеров, закупщиков и специалистов 
                  по обслуживанию клиентов, которые разделяют нашу страсть к красоте и качеству.
                </p>
              </div>
            </div>
          </section>

          {/* Наши принципы */}
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Качество</h3>
                <p className="text-gray-600">
                  Мы тщательно отбираем каждый товар, работая только с проверенными производителями
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Уют</h3>
                <p className="text-gray-600">
                  Каждый предмет в нашем каталоге способен превратить дом в место силы и вдохновения
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="text-4xl mb-4">💝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Забота</h3>
                <p className="text-gray-600">
                  Мы заботимся о каждом клиенте и стремимся превзойти ваши ожидания
                </p>
              </div>
            </div>
          </section>

          {/* Наши достижения */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-[#E5D3B3] to-[#F5E6D3] rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Наши достижения</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-[#7C5C27] mb-2">14+</div>
                  <div className="text-gray-700">лет на рынке</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#7C5C27] mb-2">10000+</div>
                  <div className="text-gray-700">довольных клиентов</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#7C5C27] mb-2">500+</div>
                  <div className="text-gray-700">уникальных товаров</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#7C5C27] mb-2">99%</div>
                  <div className="text-gray-700">положительных отзывов</div>
                </div>
              </div>
            </div>
          </section>

          {/* Команда */}
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Наша команда</h2>
              <p className="text-gray-700 mb-6">
                За успехом Provans Decor стоит талантливая команда профессионалов, 
                которые каждый день работают над тем, чтобы сделать ваш дом более красивым.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                    👩‍💼
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Отдел закупок</h4>
                    <p className="text-gray-600">Поиск и отбор лучших товаров</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                    🎨
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Дизайнеры</h4>
                    <p className="text-gray-600">Создание гармоничных коллекций</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                    📞
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Служба поддержки</h4>
                    <p className="text-gray-600">Помощь и консультации клиентов</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                    🚚
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Логистика</h4>
                    <p className="text-gray-600">Быстрая и надежная доставка</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Контакты */}
          <section>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Свяжитесь с нами</h2>
              <p className="text-gray-600 mb-6">
                Готовы помочь вам создать дом мечты. Обращайтесь к нам любым удобным способом.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">📞</span>
                  <span className="text-gray-700">8 (800) 777-18-72</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">✉️</span>
                  <span className="text-gray-700">info@provans.ru</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">🕒</span>
                  <span className="text-gray-700">Ежедневно 9:00-21:00</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
