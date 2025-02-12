import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export interface SceneControlOptions {
  id: string;
  onComplete?: () => void;
  autoStart?: boolean;
  scrollTriggerOptions?: {
    start?: string;
    end?: string;
    markers?: boolean;
  };
  handleTouch?: boolean;
  snapIntoPlace?: boolean;
  setupScene?: (controller: SceneController) => void | ScrollCallbacks;
  cleanupScene?: () => void;
}

export interface SceneController {
  play: () => void;
  pause: () => void;
  reset: () => void;
  cleanup: () => void;
}

interface ScrollCallbacks {
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

export const useSceneControl = ({
  id,
  onComplete,
  autoStart = true,
  scrollTriggerOptions = {},
  handleTouch = false,
  snapIntoPlace = false,
  setupScene,
  cleanupScene
}: SceneControlOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SceneController | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Scene Controller Setup
  useEffect(() => {
    const controller: SceneController = {
      play: () => {
        if (!isPlayingRef.current) {
          isPlayingRef.current = true;
          timelineRef.current?.play();
        }
      },
      pause: () => {
        if (isPlayingRef.current) {
          isPlayingRef.current = false;
          timelineRef.current?.pause();
        }
      },
      reset: () => {
        timelineRef.current?.restart();
      },
      cleanup: () => {
        timelineRef.current?.kill();
        ScrollTrigger.getAll().forEach(trigger => {
          if (trigger.vars.trigger === containerRef.current) {
            trigger.kill();
          }
        });
      }
    };

    controllerRef.current = controller;

    let scrollCallbacks: ScrollCallbacks | void;
    if (setupScene) {
      scrollCallbacks = setupScene(controller);
    }

    // ScrollTrigger Setup
    if (containerRef.current) {
      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: scrollTriggerOptions.start || 'top center',
        end: scrollTriggerOptions.end || 'bottom center',
        markers: scrollTriggerOptions.markers || false,
        onEnter: () => {
          if (scrollCallbacks?.onEnter) {
            scrollCallbacks.onEnter();
          }
          
          if (snapIntoPlace && containerRef.current) {
            const element = containerRef.current;
            const elementRect = element.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetY = scrollTop + elementRect.top;

            gsap.to(window, {
              duration: 0.5,
              scrollTo: { y: targetY, autoKill: true },
              ease: "power2.inOut",
              onComplete: () => {
                controller.play();
              }
            });
          } else {
            controller.play();
          }
        },
        onLeave: () => {
          if (scrollCallbacks?.onLeave) {
            scrollCallbacks.onLeave();
          }
          controller.pause();
        },
        onEnterBack: () => {
          if (scrollCallbacks?.onEnterBack) {
            scrollCallbacks.onEnterBack();
          }
          controller.play();
        },
        onLeaveBack: () => {
          if (scrollCallbacks?.onLeaveBack) {
            scrollCallbacks.onLeaveBack();
          }
          controller.pause();
        }
      });

      return () => {
        trigger.kill();
        controller.cleanup();
        if (cleanupScene) {
          cleanupScene();
        }
      };
    }

    return () => {
      controller.cleanup();
      if (cleanupScene) {
        cleanupScene();
      }
    };
  }, []);

  // Touch Event Handler
  useEffect(() => {
    if (!containerRef.current || !handleTouch) return;

    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchDuration = Date.now() - touchStartTime;
      const touchDistance = Math.abs(touchEndY - touchStartY);

      if (touchDuration < 250 && touchDistance < 10) {
        if (isPlayingRef.current) {
          controllerRef.current?.pause();
        } else {
          controllerRef.current?.play();
        }
      }
    };

    const element = containerRef.current;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouch]);

  // Auto-Start wenn aktiviert
  useEffect(() => {
    if (autoStart) {
      controllerRef.current?.play();
    }
  }, [autoStart]);

  return {
    containerRef,
    controller: controllerRef.current,
    isPlaying: isPlayingRef.current
  };
};

export default useSceneControl; 