import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'О компании | Provans Decor',
  description:
    'История компании Provans Decor. Мы создаем уникальный декор для вашего дома с 2010 года.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="container mx-auto px-4 pt-10 pb-16 flex flex-col gap-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-12 text-center">
          О нас!
        </h1>

        {/* Первый блок: видео слева + текст */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <video
            src="/video/IMG_6847.MP4"
            autoPlay
            loop
            muted
            playsInline
            className="rounded-2xl shadow-lg w-full md:w-1/2 h-[220px] md:h-[400px] object-cover"
          />
          <div className="md:w-1/2 w-full text-lg md:text-xl text-gray-800 font-light leading-relaxed">
            <p className="mb-4">
              Мы ценим эстетику, комфорт и индивидуальность в каждом предмете!
            </p>
            <p>
              Наш «Прованс бутик» — это тщательно отобранный декор со всего мира: вазы, посуда, текстиль, ароматы, фоторамки, статуэтки и многое другое, что наполнит ваш дом уютом и красотой.
            </p>
          </div>
        </div>

        {/* Второй блок: видео справа + текст */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
          <video
            src="/video/IMG_6848.MP4"
            autoPlay
            loop
            muted
            playsInline
            className="rounded-2xl shadow-lg w-full md:w-1/2 h-[220px] md:h-[400px] object-cover"
          />
          <div className="md:w-1/2 w-full text-lg md:text-xl text-gray-800 font-light leading-relaxed">
            <p className="mb-4">
              Элегантность Парижа, сдержанность Японии, уют Тосканы и тепло Португалии — в каждой детали.
            </p>
            <p>
              Мы помогаем превратить дом в отражение вашего вкуса, создавая гармоничное пространство с уютной атмосферой.
            </p>
          </div>
        </div>

        {/* Фото-блоки */}
        <section className="container mx-auto px-4 max-w-6xl flex flex-col gap-16">
          {/* 1 */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2 w-full">
              <img
                src="/uploads/blog-left1.jpg"
                alt="О нас Provans Decor"
                className="rounded-2xl w-full h-[260px] md:h-[340px] object-cover shadow-md"
                draggable={false}
              />
            </div>
            <div className="md:w-1/2 w-full text-lg md:text-xl text-gray-800 font-light leading-relaxed">
              <p>
                В летний период наш «Прованс» напоминает цветущий сад. Мы напрямую работаем с лучшими мировыми производителями искусственных растений из Нидерландов. Качество настолько высоко, что их легко можно принять за настоящие растения.
              </p>
            </div>
          </div>

          {/* 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
            <div className="md:w-1/2 w-full">
              <img
                src="/uploads/blog-left2.jpg"
                alt="О нас Provans Decor"
                className="rounded-2xl w-full h-[260px] md:h-[340px] object-cover shadow-md"
                draggable={false}
              />
            </div>
            <div className="md:w-1/2 w-full text-lg md:text-xl text-gray-800 font-light leading-relaxed">
              <p className="mb-4">
                В Новый год мы создаем невероятную сказку и атмосферу праздника. Елочные игрушки, гирлянды и декоративные композиции наполняют бутик магией и уютом.
              </p>
              <p>
                Каждая деталь помогает создавать праздничное настроение, которое хочется сохранить в интерьере вашего дома.
              </p>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
