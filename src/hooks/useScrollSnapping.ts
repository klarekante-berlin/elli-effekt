import { useState, useCallback, useEffect } from 'react';
import { LenisInstance } from 'lenis/react';

interface ScrollSnappingOptions {
  threshold?: number;
  duration?: number;
  easing?: (t: number) => number;
}

const DEFAULT_OPTIONS: ScrollSnappingOptions = {
  threshold: 50,
  duration: 1.5,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
};

export const useScrollSnapping = (
  lenisInstance?: LenisInstance | null,
  options: ScrollSnappingOptions = DEFAULT_OPTIONS
) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [isAnimationScene, setIsAnimationScene] = useState(false);

  const handleScroll = useCallback(({ scroll, velocity }: { scroll: number; velocity: number }) => {
    if (isScrolling || isAnimationScene || Math.abs(velocity) > 0.1) return;

    const sections = document.querySelectorAll('.section');
    const currentScrollPosition = scroll;
    
    let closestSection = null;
    let minDistance = Infinity;
    
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = currentScrollPosition + rect.top;
      const distance = Math.abs(currentScrollPosition - sectionTop);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSection = section;
      }
    });
    
    if (closestSection && minDistance > (options.threshold || DEFAULT_OPTIONS.threshold) && lenisInstance) {
      setIsScrolling(true);
      lenisInstance.scrollTo(closestSection, {
        duration: options.duration,
        easing: options.easing
      });
      
      setTimeout(() => {
        setIsScrolling(false);
      }, (options.duration || DEFAULT_OPTIONS.duration) * 1000);
    }
  }, [isScrolling, isAnimationScene, lenisInstance, options]);

  useEffect(() => {
    if (!lenisInstance) return;

    lenisInstance.on('scroll', handleScroll);
    
    return () => {
      lenisInstance.off('scroll', handleScroll);
    };
  }, [lenisInstance, handleScroll]);

  return {
    isScrolling,
    setIsScrolling,
    isAnimationScene,
    setIsAnimationScene
  };
}; 