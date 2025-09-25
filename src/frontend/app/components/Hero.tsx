"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.5;
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let ticking = false;

  const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        // when the bottom of hero is above the top of viewport (scrolled past), hide video
        const shouldHide = rect.bottom <= 0;
        setHidden(shouldHide);
        ticking = false;
      });
    };

    // run once to set initial state
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
  <section ref={sectionRef} className="absolute top-0 left-0 w-full -mt-px sm:-mt-[2px] md:mt-0 h-[40vh] min-h-[260px] sm:h-[56vh] md:h-screen lg:h-screen overflow-hidden mb-16 md:mb-24">

      {/* Video background fixed to viewport top so it can sit under the header */}
  <video
    ref={videoRef}
    className={`absolute inset-0 w-full h-full object-cover object-top md:object-center z-0 pointer-events-none transition-opacity duration-300 ease-out bg-black ${hidden ? "opacity-0" : "opacity-100"}`}
        src="/video/7s-move.mp4"
        autoPlay
        loop
        muted
        playsInline
        poster="/placeholder.jpg"
      />

      {/* Overlay tint above the video */}
    <div
      className={`absolute inset-0 w-full h-full bg-black/20 z-10 pointer-events-none transition-opacity duration-300 ease-out ${hidden ? "opacity-0" : "opacity-100"}`}
      style={{ boxShadow: "0 32px 32px -16px rgba(0,0,0,0.10)" }}
    />

      {/* Content block: positioned relative so it sits above the video */}
        <div className="relative z-20 flex items-start md:items-start lg:items-start h-full">
          <div className="w-full max-w-2xl pl-6 sm:pl-8 md:pl-12 pr-4 md:pr-12 pb-6 sm:pb-8 md:pb-12 pt-[12vh] sm:pt-[clamp(16vh,10vh+4vw,22vh)] md:pt-[clamp(28vh,18vh+8vw,40vh)] lg:pt-[clamp(32vh,22vh+8vw,46vh)]">
          <h1
            className="text-white font-serif font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 drop-shadow-xl leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Искусство уюта
          </h1>

          <p
            className="text-white text-sm sm:text-base md:text-lg lg:text-xl mb-6 max-w-xl font-light drop-shadow"
            style={{ letterSpacing: "0.01em" }}
          >
            Познакомьтесь с миром утончённых деталей, создающих красоту вашего интерьера
          </p>

          <div className="flex xs:flex-col flex-row gap-3 sm:gap-4">
            <Link
              href="/catalog/new-year"
              className="inline-flex justify-center bg-white text-gray-900 font-semibold px-6 sm:px-10 md:px-12 py-2.5 sm:py-3 rounded-full shadow transition text-sm sm:text-base md:text-lg hover:bg-gray-100"
            >
              Новый год
            </Link>

            <Link
              href="/catalog/all-category"
              className="inline-flex justify-center bg-transparent border border-white text-white font-semibold px-6 sm:px-10 md:px-12 py-2.5 sm:py-3 rounded-full shadow hover:bg-white/10 transition text-sm sm:text-base md:text-lg"
            >
              Каталог
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
