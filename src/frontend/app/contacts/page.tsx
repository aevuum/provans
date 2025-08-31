"use client";
import { useState, useEffect, useRef } from "react";
import { FaVk, FaTelegram, FaInstagram } from "react-icons/fa";

const API_KEY = "19856708-91fc-4ac8-b228-4441a1d32afd";

export default function ContactsPage() {
  const [appealType, setAppealType] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);

  const appealOptions = [
    "Отзыв о работе интернет-магазина",
    "Отзыв о работе розничного магазина",
    "Нужна консультация по товару",
    "Вопрос про подарочный сертификат или бонусы",
    "Другое",
  ];

  const cities = [
    "Москва",
    "Санкт-Петербург",
    "Владимир",
    "Казань",
    "Нижний Новгород",
    "Ростов-на-Дону",
    "Екатеринбург",
    "Новосибирск",
    "Краснодар",
  ];

  // Инициализация Яндекс.Карты
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${API_KEY}&lang=ru_RU`;
    script.type = "text/javascript";
    script.onload = () => {
      if (typeof window.ymaps !== "undefined") {
        window.ymaps.ready(() => {
          const myMap = new window.ymaps.Map(mapRef.current, {
            center: [56.1297, 40.4068], // Владимир
            zoom: 12,
            controls: ["zoomControl", "fullscreenControl"],
          });

          const myPlacemark = new window.ymaps.Placemark(
            [56.1297, 40.4068],
            {
              hintContent: "Provans Decor",
              balloonContent: "Владимир, ул. Большая Московская, дом 19, корпус 1",
            },
            {
              preset: "islands#brownIcon",
            }
          );

          myMap.geoObjects.add(myPlacemark);
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div className="w-full flex justify-center md:py-3">
      <div className="w-full max-w-screen-xl px-4 py-6 md:py-3 flex flex-col gap-8">
        <h1 className="text-3xl md:text-4xl font-bold flex content-center uppercase mt-3" style={{letterSpacing: '0.04em'}}>Контакты</h1>
        {/* Форма и поддержка */}
        <div className="w-full flex flex-col md:flex-row gap-8 items-start">
        {/* Форма */}
    <div className="bg-[#F5F1E9] p-6 md:p-10 rounded-2xl shadow-lg flex-1 min-w-0 md:mr-4">
          <h2 className="text-2xl font-semibold mb-2">Напишите нам</h2>
          <p className="text-gray-700 mb-4">Если у вас есть вопросы, предложения или пожелания — оставьте сообщение.</p>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Тип обращения</label>
              <div className="relative">
                <select
                  value={appealType}
                  onChange={(e) => setAppealType(e.target.value)}
                  className="w-full border rounded-md p-2 pr-8 focus:ring-2 focus:ring-[#b07d62] outline-none appearance-none"
                  style={{paddingRight: '2.5rem'}}
                >
                <option value="">Выберите...</option>
                {appealOptions.map((opt, idx) => (
                  <option key={idx} value={opt}>{opt}</option>
                ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">▼</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Город</label>
              <input
                list="cities"
                placeholder="Введите город"
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-[#b07d62] outline-none"
              />
              <datalist id="cities">
                {cities.map((city, idx) => (
                  <option key={idx} value={city} />
                ))}
              </datalist>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Имя *</label>
                <input type="text" className="w-full border rounded-md p-2 focus:ring-2 focus:ring-[#b07d62] outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Телефон *</label>
                <input type="tel" placeholder="+7 ___ ___-__-__" className="w-full border rounded-md p-2 focus:ring-2 focus:ring-[#b07d62] outline-none" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input type="email" className="w-full border rounded-md p-2 focus:ring-2 focus:ring-[#b07d62] outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Сообщение</label>
              <textarea rows={4} className="w-full border rounded-md p-2 focus:ring-2 focus:ring-[#b07d62] outline-none"></textarea>
            </div>
            <button className="bg-[#b07d62] text-white px-6 py-2 rounded-md hover:bg-[#94614b] transition w-full md:w-auto">Отправить</button>
          </form>
        </div>
        {/* Поддержка */}
    <div className="bg-[#F5F1E9] p-6 md:p-10 rounded-2xl shadow-lg w-full md:w-auto md:min-w-[280px] md:max-w-xs ml-0 mt-8 md:mt-0 flex-shrink-0">
          <div>
            <h3 className="text-xl font-semibold mb-2">Служба поддержки</h3>
            <p className="mb-1">Ежедневно с 10:00 до 21:00</p>
            <p className="mb-1">
              Телефон: <a href="tel:+78007771872" className="text-[#b07d62] font-medium">+7 (800) 777-18-72</a>
            </p>
            <p className="mb-3">
              Email: <a href="mailto:info@provans.ru" className="text-[#b07d62] font-medium">info@provans.ru</a>
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Каналы связи</h4>
            <div className="flex gap-4 text-2xl">
              <a href="https://vk.com" target="_blank" className="hover:text-[#b07d62]"><FaVk /></a>
              <a href="https://t.me" target="_blank" className="hover:text-[#b07d62]"><FaTelegram /></a>
              <a href="https://instagram.com" target="_blank" className="hover:text-[#b07d62]"><FaInstagram /></a>
            </div>
          </div>
        </div>
        </div>
        {/* Реквизиты и карта */}
        <div className="w-full flex flex-col md:flex-row gap-8 items-start">
          <div className="bg-[#F5F1E9] p-6 md:p-10 rounded-2xl shadow-lg flex flex-col gap-2 w-full md:w-auto md:max-w-md flex-shrink-0">
          <h3 className="text-xl font-semibold mb-2">Реквизиты</h3>
          <p>ИП Иванова Марина Владимировна</p>
          <p>ИНН: 331104608809</p>
          <p>ОГРН: 307333915500010</p>
          <p>Телефон: +7 (800) 777-18-72</p>
          <div className="flex items-center gap-2 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#b07d62]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 17.362a9 9 0 111.414-1.414l4.243 4.243a1 1 0 01-1.414 1.414l-4.243-4.243z" />
              <circle cx="11" cy="11" r="5" />
            </svg>
            <span>Владимир, ул. Большая Московская, дом 19, корпус 1</span>
          </div>
        </div>
          <div className="flex-1">
            <div className="bg-[#F5F1E9] p-2 md:p-4 rounded-2xl shadow-lg w-full h-[300px] md:h-[420px]">
              <div ref={mapRef} className="w-full h-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
