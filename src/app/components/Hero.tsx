"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // замедляем видео
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  return (
    <>
      <>
            <div className="absolute inset-0 bg-black/20 z-10" />
       <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/video/7s-move.mp4"
        autoPlay
        loop
        muted
        playsInline
        poster="/placeholder.jpg"
      />
    </>

    <section className="relative w-full h-[80vh] min-h-[320px] flex items-center justify-start overflow-hidden">
     

      {/* Контент */}
      <div className="relative z-20 mb-0  flex flex-col items-start justify-center h-full text-left px-10 md:px-12 w-full max-w-3xl">
        <h1
          className="text-white font-serif font-extrabold text-5xl md:text-5xl lg:text-6xl mb-2 drop-shadow-xl leading-tight"
          style={{ letterSpacing: "-0.03em" }}
        >
          Искусство уюта
        </h1>
        <p
          className="text-white text-base sm:text-lg md:text-xl mb-6 max-w-xl font-light drop-shadow"
          style={{ letterSpacing: "0.01em" }}
        >
          Познакомьтесь с миром утончённых деталей, создающих красоту вашего
          интерьера
        </p>

        {/* Кнопки */}
        <div className="flex xs:flex-col flex-row  gap-3 sm:gap-4 ">
          <Link
            href="/catalog/promotions"
            className="inline-flex justify-center bg-white text-gray-900 font-semibold px-10 sm:px-11 md:px-12 py-2.5 sm:py-3 rounded-full shadow transition text-base sm:text-lg hover:bg-gray-100"
          >
            Акции
          </Link>
          <Link
            href="/catalog/all"
            className="inline-flex justify-center bg-transparent border border-white text-white font-semibold px-10 sm:px-11 md:px-12 py-2.5 sm:py-3 rounded-full shadow hover:bg-white/10 transition text-base sm:text-lg"
          >
            Каталог
          </Link>
        </div>
      </div>
    </section>
    </>
  );
};

export default Hero;
