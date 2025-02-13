import { useState, useCallback, useEffect } from 'react';
import { LenisInstance } from 'lenis/react';
import { useScene } from '../context/SceneContext';

interface ScrollSnappingOptions {
  threshold?: number;
  duration?: number;
  easing?: (t: number) => number;
}

const DEFAULT_OPTIONS: Required<ScrollSnappingOptions> = {
  threshold: 400,
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
};

export const useScrollSnapping = (
  lenisInstance?: LenisInstance | null,
  options: ScrollSnappingOptions = DEFAULT_OPTIONS
) => {
  const { dispatch } = useScene();
  const [isScrolling, setIsScrolling] = useState(false);
  const [isAnimationScene, setIsAnimationScene] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);

  const handleScroll = useCallback(({ scroll, velocity }: { scroll: number; velocity: number }) => {
    if (!lenisInstance || isScrolling || isAnimationScene || Math.abs(velocity) > 0.1) {
      setLastScrollPosition(scroll);
      return;
    }

    const scenes = Array.from(document.querySelectorAll<HTMLDivElement>('.scene'));
    const currentScrollPosition = scroll;
    const scrollingUp = currentScrollPosition < lastScrollPosition;
    const viewportHeight = window.innerHeight;
    const triggerPoint = viewportHeight * 0.5;

    let closestSnapScene: HTMLDivElement | null = null;
    let minDistance = Infinity;

    scenes.forEach((scene) => {
      if (!scene.classList.contains('snap-scene')) return;

      const rect = scene.getBoundingClientRect();
      const sceneCenter = rect.top + rect.height / 2;
      const distance = Math.abs(sceneCenter - triggerPoint);

      const isInDirection = scrollingUp ? 
        (rect.bottom > 0 && rect.top < triggerPoint) : 
        (rect.top < viewportHeight && rect.bottom > triggerPoint);

      if (isInDirection && distance < minDistance) {
        minDistance = distance;
        closestSnapScene = scene;
      }
    });

    const threshold = options.threshold ?? DEFAULT_OPTIONS.threshold;

    if (closestSnapScene && minDistance < threshold) {
      setIsScrolling(true);
      const targetElement = closestSnapScene as HTMLDivElement;
      const sceneId = targetElement.dataset.sceneId;

      if (sceneId) {
        dispatch({
          type: 'HANDLE_SCENE_ACTIVATION',
          payload: {
            id: sceneId,
            isScrollable: targetElement.dataset.scrollable === 'true'
          }
        });

        dispatch({
          type: 'UPDATE_SCENE',
          payload: {
            id: sceneId,
            updates: { 
              isActive: true,
              isAnimating: true
            }
          }
        });

        dispatch({ type: 'SET_CURRENT_SCENE', payload: sceneId });
      }
      
      lenisInstance.scrollTo(targetElement, {
        duration: options.duration ?? DEFAULT_OPTIONS.duration,
        easing: options.easing ?? DEFAULT_OPTIONS.easing,
        offset: -(viewportHeight - targetElement.offsetHeight) / 2
      });

      setTimeout(() => {
        setIsScrolling(false);
        if (sceneId) {
          dispatch({
            type: 'UPDATE_SCENE',
            payload: {
              id: sceneId,
              updates: { isAnimating: false }
            }
          });
        }
      }, (options.duration ?? DEFAULT_OPTIONS.duration) * 1000);
    }

    setLastScrollPosition(currentScrollPosition);
  }, [isScrolling, isAnimationScene, lenisInstance, options, lastScrollPosition, dispatch]);

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