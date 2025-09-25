"use client";

import { useEffect } from "react";

export default function VideoController() {
  useEffect(() => {
    const video = document.querySelector('.site-video-bg') as HTMLElement | null;
    const hero = document.querySelector('.hero-section') as HTMLElement | null;
    if (!video || !hero) return;

    let raf = 0;

    const update = () => {
      const rect = hero.getBoundingClientRect();
      // if hero bottom is <= 0 (scrolled past) hide video
      if (rect.bottom <= 0) {
        video.classList.add('hidden-by-scroll');
      } else {
        video.classList.remove('hidden-by-scroll');
      }
    };

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return null;
}
