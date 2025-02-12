import { useEffect, useRef } from 'react';
import { ReactLenis, LenisRef } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../stores/scrollStore';

export const LENIS_CONFIG = {
  duration: 1.2,
  orientation: 'vertical' as const,
  gestureOrientation: 'vertical' as const,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
  infinite: false,
  syncTouch: true,
  autoRaf: false, // Wichtig: Wir nutzen GSAP's RAF
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) // Optimierte Easing-Funktion für Snapping
} as const;

export const useLenisScroll = () => {
  const lenisRef = useRef<LenisRef>(null);
  const { updateScrollState, setScrollThreshold, isMobile } = useScrollStore();

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

    // Scroll Event Handler für Store Updates
    const handleScroll = ({ scroll, velocity }: { scroll: number; velocity: number }) => {
      updateScrollState(scroll, velocity);
    };

    // RAF Loop für GSAP und Lenis
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // Lenis Event Listener
    lenis.on('scroll', handleScroll);

    // Passe Scroll-Schwellenwert für mobile Geräte an
    setScrollThreshold(isMobile ? 150 : 100);

    // ScrollTrigger Refresh nach Lenis-Initialisierung
    ScrollTrigger.refresh();

    return () => {
      lenis.off('scroll', handleScroll);
      ScrollTrigger.scrollerProxy(document.documentElement, {});
      ScrollTrigger.refresh();
    };
  }, []);

  return lenisRef;
}; 