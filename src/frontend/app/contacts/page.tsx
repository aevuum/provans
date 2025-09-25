"use client";
import { useState, useEffect, useRef } from "react";
import { FaVk, FaTelegram, FaInstagram } from "react-icons/fa";

// Prefer an env var for the API key in production; keep a fallback for local dev.
const API_KEY = process.env.NEXT_PUBLIC_YMAPS_API_KEY || "19856708-91fc-4ac8-b228-4441a1d32afd";

// Lightweight local typings for ymaps to avoid `any` usage
type YMapInstance = {
  geoObjects: { removeAll: () => void; add: (obj: unknown) => void };
  container?: { fitToViewport?: () => void };
};

type YMapsGlobal = {
  ready: (cb: () => void) => void;
  Map: new (el: HTMLElement | null, opts: { center: [number, number]; zoom: number; controls?: string[] }) => YMapInstance;
  Placemark: new (
    coords: [number, number],
    data?: { hintContent?: string; balloonContent?: string },
    options?: Record<string, unknown>
  ) => unknown;
  geocode?: (query: string, options?: Record<string, unknown>) => Promise<any>;
};

export default function ContactsPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  // состояние выбранного/введённого города
  const [city, setCity] = useState("");
  const [scriptFailed, setScriptFailed] = useState(false);


  // Основной список городов (20 основных) — отображаемые в выпадающем списке
  const cities = [
    'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород',
    'Казань', 'Челябинск', 'Омск', 'Самара', 'Ростов-на-Дону',
    'Уфа', 'Красноярск', 'Пермь', 'Воронеж', 'Волгоград',
    'Краснодар', 'Саратов', 'Тольятти', 'Ижевск', 'Ульяновск'
  ];

  // Инициализация Яндекс.Карты — более надёжно: добавляем скрипт один раз и инициализируем при готовности
  useEffect(() => {
    // helper to safely access typed ymaps global
    const getYMaps = (): YMapsGlobal | undefined => {
      if (typeof window === 'undefined') return undefined;
      return (window as unknown as { ymaps?: YMapsGlobal }).ymaps;
    };
    const initMap = () => {
      const Y = getYMaps();
      if (!Y || !mapRef.current) return;
  const address = 'Владимир, ул. Большая Московская, дом 19а';
      const svgPin = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23b07d62' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z'/%3E%3C/svg%3E";

      // Try geocoding the address first so the placemark appears exactly at the house
      const doCreateMap = (coords: [number, number]) => {
        try {
          const myMap = new Y.Map(mapRef.current, {
            center: coords,
            zoom: 16,
            controls: ['zoomControl', 'fullscreenControl'],
          });

          const myPlacemark = new Y.Placemark(
            coords,
            {
              hintContent: 'Provance Decor',
              balloonContent: `${address}`,
            },
            {
              iconLayout: 'default#image',
              iconImageHref: svgPin,
              iconImageSize: [48, 48],
              iconImageOffset: [-24, -48],
            }
          );

          myMap.geoObjects.removeAll();
          myMap.geoObjects.add(myPlacemark);
          try { myMap.container?.fitToViewport?.(); } catch { }
        } catch (e) {
          console.warn('ymaps map/placemark creation failed', e);
        }
      };

      // Use geocoding if available, otherwise fall back to hardcoded coords
      try {
        if (typeof (Y as any).geocode === 'function') {
          console.info('ymaps: geocode available, querying for address:', address);
          const geocodeFn = (Y as any).geocode as (q: string) => Promise<any>;
          geocodeFn.call(Y, address).then((res: any) => {
            try {
              const first = res.geoObjects && res.geoObjects.get(0);
              const coords = first?.geometry?.getCoordinates?.();
              console.info('ymaps: geocode result coords:', coords);
              if (coords && Array.isArray(coords) && coords.length >= 2) {
                doCreateMap([coords[0], coords[1]] as [number, number]);
                return;
              }
              console.warn('ymaps: geocode returned no usable coordinates, using fallback');
            } catch (e) {
              console.warn('ymaps geocode parse failed', e);
            }
            // fallback coordinates for Vladimir
            doCreateMap([56.1297, 40.4068]);
          }).catch((err: any) => {
            console.warn('ymaps geocode error', err);
            doCreateMap([56.1297, 40.4068]);
          });
        } else {
          console.info('ymaps: geocode not available, using fallback coords');
          doCreateMap([56.1297, 40.4068]);
        }
      } catch (e) {
        console.warn('ymaps geocode invocation failed', e);
        doCreateMap([56.1297, 40.4068]);
      }
    };

    // если уже загружен — инициализируем сразу
    const Yglobal = (window as unknown as { ymaps?: YMapsGlobal }).ymaps;
    if (typeof window !== 'undefined' && Yglobal) {
      Yglobal.ready(initMap);
      return;
    }

    // иначе добавляем скрипт (если он ещё не добавлен)
    const scriptBase = `https://api-maps.yandex.ru/2.1/`;
    let readyInterval: number | undefined;
    const existing = Array.from(document.scripts).find(s => typeof s.src === 'string' && s.src.startsWith(scriptBase));
    if (!existing) {
      const scriptSrc = `${scriptBase}?apikey=${API_KEY}&lang=ru_RU`;
      console.info('ymaps: adding script', scriptSrc);
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.onload = () => {
        console.info('ymaps: script loaded');
        const Y2 = (window as unknown as { ymaps?: YMapsGlobal }).ymaps;
        if (Y2) Y2.ready(() => {
          console.info('ymaps: ready triggered after script load');
          initMap();
        });
      };
      script.onerror = (err) => {
        console.error('ymaps: script failed to load', err);
        setScriptFailed(true);
      };
      document.body.appendChild(script);
    } else {
      console.info('ymaps: script already present, waiting for ready');
      // если скрипт уже есть — дождёмся ready
      readyInterval = window.setInterval(() => {
        const Y2 = (window as unknown as { ymaps?: YMapsGlobal }).ymaps;
        if (Y2) {
          if (readyInterval) window.clearInterval(readyInterval);
          console.info('ymaps: detected global ymaps, calling ready');
          Y2.ready(initMap);
        }
      }, 200) as unknown as number;
    }

    return () => {
      if (readyInterval) window.clearInterval(readyInterval as unknown as number);
    };
  }, []);

  // Компонент: комбобокс для выбора/ввода города — показывает сразу весь список городов
  function CitySelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
      const onDocClick = (e: MouseEvent) => {
        if (!wrapperRef.current) return;
        if (!(e.target instanceof Node)) return;
        if (!wrapperRef.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener('click', onDocClick);
      return () => document.removeEventListener('click', onDocClick);
    }, []);

    const visibleItems = cities; // все города сразу

    return (
      <div ref={wrapperRef} className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder=""
          className="w-full border rounded-md p-2 pr-10 focus:ring-2 focus:ring-[#b07d62] outline-none"
        />
        <button
          type="button"
          aria-label="Показать список городов"
          onClick={() => setOpen((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M7 8l3 3 3-3" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 right-0 mt-2 bg-white border rounded-md shadow-lg z-50 max-h-56 overflow-auto">
            <ul>
              {visibleItems.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => { onChange(c); setOpen(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-screen-xl px-4 pt-16 pb-16 md:pb-20 flex flex-col gap-8">
        
        <h1 className="text-3xl md:text-4xl tracking-wider text-center mb-8 text-gray-800 section-heading" style={{letterSpacing: '0.04em'}}>Контакты</h1>
    {/* Форма и поддержка */}
    <div className="w-full flex flex-col md:flex-row gap-8 items-start">
    {/* Форма */}
  <div className="bg-[#F5F1E9] p-6 md:p-10 rounded-2xl shadow-lg flex-1 min-w-0 md:mr-4">
          <h2 className="text-2xl font-semibold mb-2">Напишите нам</h2>
          <p className="text-gray-700 mb-4">Если у вас есть вопросы, предложения или пожелания — оставьте сообщение.</p>
          <form className="space-y-4">
            {/* Первая строка: Имя + Фамилия */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Имя</label>
                <input type="text" name="firstName" className="w-full border rounded-md p-2 focus:ring-2 focus:ring-[#b07d62] outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Фамилия</label>
                <input type="text" name="lastName" className="w-full border rounded-md p-2 focus:ring-2 focus:ring-[#b07d62] outline-none" />
              </div>
            </div>

            {/* Вторая строка: Город + Телефон */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Город</label>
                <div>
                  {/* Компонент комбобокс: ввод + список */}
                  <CitySelector value={city} onChange={setCity} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Телефон </label>
                <input type="tel" name="phone" placeholder="+7 ___ ___-__-__" className="w-full border rounded-md p-2 focus:ring-2 focus:ring-[#b07d62] outline-none" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email </label>
              <input type="email" className="w-full border rounded-md p-2 focus:ring-2 focus:ring-[#b07d62] outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Сообщение</label>
              <textarea rows={4} className="w-full border rounded-md p-2 focus:ring-2 focus:ring-[#b07d62] outline-none"></textarea>
            </div>
            <button className="bg-[#b07d62] text-white px-6 py-2 rounded-md hover:bg-[#94614b] transition w-full md:w-auto">Отправить</button>
          </form>
        </div>
        {/* Правая колонка: поддержка + реквизиты */}
  <div className="w-full md:w-auto md:min-w-[320px] md:max-w-sm ml-0 mt-8 md:mt-0 flex-shrink-0 flex flex-col gap-4">
          {/* Поддержка */}
          <div className="bg-[#F5F1E9] p-6 md:p-10 rounded-2xl shadow-lg w-full">
            <div>
              <h3 className="text-xl font-semibold mb-2">Служба поддержки</h3>
              <p className="mb-1">Ежедневно с 10:00 до 21:00</p>
              <p className="mb-1">
                Телефон: <a href="tel:+78007771872" className="text-[#b07d62] font-medium">+7 (800) 777-18-72</a>
              </p>
              <p className="mb-3">
                  Email: <a href="mailto:info@provance.ru" className="text-[#b07d62] font-medium">info@provance.ru</a>
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
          {/* Реквизиты под поддержкой */}
          <div className="bg-[#F5F1E9] p-6 md:p-10 rounded-2xl shadow-lg w-full">
            <h3 className="text-xl font-semibold mb-2">Реквизиты</h3>
            <p>ИП Иванова Марина Владимировна</p>
            <p>ИНН: 331104608809</p>
            <p>ОГРН: 307333915500010</p>
            <p>Телефон: +7 (800) 777-18-72</p>
              <div className="flex items-center gap-2 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-[#b07d62]" fill="currentColor" aria-hidden>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
              </svg>
              <span>Владимир, ул. Большая Московская, дом 19а</span>
            </div>
          </div>
        </div>
        </div>

  {/* Карта — на всю ширину */}
        <div className="w-full">
          <div className="bg-[#F5F1E9] p-2 md:p-4 rounded-2xl shadow-lg w-full h-[360px] md:h-[520px]">
              {scriptFailed ? (
                <iframe
                  title="map-fallback"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=40.3968%2C56.1247%2C40.4168%2C56.1347&layer=mapnik&marker=56.1297%2C40.4068`}
                  className="w-full h-full rounded-2xl"
                  style={{ border: 0 }}
                />
              ) : (
                <div ref={mapRef} className="w-full h-full rounded-2xl" />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
