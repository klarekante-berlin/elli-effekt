import { useState, useCallback } from 'react';
import { LenisInstance } from 'lenis/react';

interface SceneNavigationOptions {
  duration?: number;
  easing?: (t: number) => number;
}

const DEFAULT_OPTIONS: SceneNavigationOptions = {
  duration: 1.5,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
};

export const useSceneNavigation = (
  lenisInstance?: LenisInstance | null,
  options: SceneNavigationOptions = DEFAULT_OPTIONS
) => {
  const [currentScene, setCurrentScene] = useState<string>('welcome');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateToScene = useCallback((sceneId: string) => {
    setIsTransitioning(true);
    
    if (lenisInstance) {
      lenisInstance.scrollTo(`#${sceneId}`, {
        duration: options.duration,
        easing: options.easing
      });

      // Reset transition state after animation
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentScene(sceneId);
      }, (options.duration || DEFAULT_OPTIONS.duration) * 1000);
    } else {
      // Fallback wenn kein Lenis verfügbar
      const element = document.getElementById(sceneId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          setIsTransitioning(false);
          setCurrentScene(sceneId);
        }, 1000);
      }
    }
  }, [lenisInstance, options.duration, options.easing]);

  return {
    currentScene,
    isTransitioning,
    navigateToScene
  };
}; 