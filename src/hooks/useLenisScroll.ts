import { useEffect, useRef } from 'react';
import { ReactLenis, LenisRef } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const LENIS_CONFIG = {
  duration: 1.2,
  orientation: 'vertical' as const,
  gestureOrientation: 'vertical' as const,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
  infinite: false,
  syncTouch: true,
  autoRaf: false // Wichtig: Wir nutzen GSAP's RAF
} as const;

export const useLenisScroll = () => {
  const lenisRef = useRef<LenisRef>(null);

  // GSAP-Lenis Integration
  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    // ScrollTrigger Proxy für Lenis
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight
        };
      },
      pinType: "transform"
    });

    // RAF Loop für GSAP und Lenis
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // ScrollTrigger Refresh nach Lenis-Initialisierung
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.scrollerProxy(document.documentElement, {});
      ScrollTrigger.refresh();
    };
  }, []);

  return lenisRef;
}; 