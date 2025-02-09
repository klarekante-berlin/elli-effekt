import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useSceneStore, SceneId } from '../stores/sceneStore';
import { useInitializeStore } from '../hooks/useInitializeStore';
import { useLenisScroll } from '../hooks/useLenisScroll';
import { useScrollStore } from '../stores/scrollStore';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Basis-Interface für alle Szenen
export interface BaseSceneProps {
  id: Exclude<SceneId, null>;
  onComplete?: () => void;
  autoStart?: boolean;
  scrollTriggerOptions?: {
    start?: string;
    end?: string;
    markers?: boolean;
  };
}

// Interface für den Scene Controller
interface SceneController {
  play: () => void;
  pause: () => void;
  reset: () => void;
  cleanup: () => void;
}

// Interface für ScrollTrigger Callbacks
interface ScrollCallbacks {
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

// HOC Optionen Interface
interface WithSceneControlOptions {
  setupScene?: (props: any, controller: SceneController) => void | ScrollCallbacks;
  cleanupScene?: () => void;
  handleScroll?: boolean;
  handleTouch?: boolean;
  snapIntoPlace?: boolean;
}

export const withSceneControl = <P extends BaseSceneProps>(
  WrappedComponent: React.ComponentType<P>,
  options: WithSceneControlOptions = {}
) => {
  return function WithSceneControlComponent(props: P) {
    const {
      id,
      onComplete,
      autoStart = true,
      scrollTriggerOptions = {},
      ...rest
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<SceneController | null>(null);
    const isPlayingRef = useRef<boolean>(false);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const scrollCallbacksRef = useRef<ScrollCallbacks | void>(undefined);
    const isInitialized = useInitializeStore();
    const lenisRef = useLenisScroll();
    const { 
      isScrolling, 
      setIsScrolling, 
      setCurrentScene,
      sceneStates,
      currentScene,
      previousScene 
    } = useSceneStore();
    const { 
      updateScrollState,
      setScrollThreshold,
      scrollThreshold 
    } = useScrollStore();

    // Zentrale Funktion für das Snapping
    const handleSnapping = (direction: 'enter' | 'enterBack') => {
      const targetScene = sceneStates[id];
      const isScrollingFromAvocado = previousScene === 'avocado-scene';
      const shouldSnap = direction === 'enter' 
        ? targetScene?.requiresSnapping
        : targetScene?.requiresSnapping || isScrollingFromAvocado;

      console.log(`Scene ${id}: Handle Snapping`, {
        direction,
        shouldSnap,
        isScrollingFromAvocado,
        requiresSnapping: targetScene?.requiresSnapping,
        isScrolling,
        isInitialized
      });

      if (shouldSnap && containerRef.current && isInitialized && lenisRef.current?.lenis) {
        const element = containerRef.current;
        const lenis = lenisRef.current.lenis;

        setIsScrolling(true);

        const elementRect = element.getBoundingClientRect();
        const offset = window.innerHeight / 2 - elementRect.height / 2;

        console.log(`Scene ${id}: Snapping`, {
          offset,
          direction,
          elementTop: elementRect.top
        });

        lenis.scrollTo(element, {
          offset,
          immediate: false,
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          onComplete: () => {
            console.log(`Scene ${id}: Snap Complete`);
            setTimeout(() => {
              setIsScrolling(false);
              const shouldAutoStart = id !== 'video-scene' || (autoStart && !isScrolling);
              if (shouldAutoStart && controllerRef.current) {
                controllerRef.current.play();
              }
            }, 100);
          }
        });
      }
    };

    // Scene Controller Setup
    useEffect(() => {
      if (!isInitialized) return;

      const controller: SceneController = {
        play: () => {
          if (!isPlayingRef.current && !isScrolling) {
            console.log(`Scene ${id}: Play`, { isScrolling });
            isPlayingRef.current = true;
            timelineRef.current?.play();
          }
        },
        pause: () => {
          if (isPlayingRef.current) {
            console.log(`Scene ${id}: Pause`);
            isPlayingRef.current = false;
            timelineRef.current?.pause();
          }
        },
        reset: () => {
          console.log(`Scene ${id}: Reset`);
          timelineRef.current?.restart();
        },
        cleanup: () => {
          console.log(`Scene ${id}: Cleanup`);
          timelineRef.current?.kill();
          ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.vars.trigger === containerRef.current) {
              trigger.kill();
            }
          });
        }
      };

      controllerRef.current = controller;

      if (options.setupScene) {
        scrollCallbacksRef.current = options.setupScene(props, controller);
      }

      return () => {
        controller.cleanup();
        if (options.cleanupScene) {
          options.cleanupScene();
        }
      };
    }, [isInitialized]);

    // ScrollTrigger Setup
    useEffect(() => {
      if (!isInitialized || !containerRef.current || !options.handleScroll) return;

      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;

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

      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: scrollTriggerOptions.start || 'top center',
        end: scrollTriggerOptions.end || 'bottom center',
        markers: scrollTriggerOptions.markers || false,
        onEnter: () => {
          console.log(`Scene ${id}: Enter`);
          setCurrentScene(id);
          if (scrollCallbacksRef.current?.onEnter) {
            scrollCallbacksRef.current.onEnter();
          }
          if (!isScrolling && isInitialized) {
            requestAnimationFrame(() => handleSnapping('enter'));
          }
        },
        onLeave: () => {
          console.log(`Scene ${id}: Leave`);
          if (scrollCallbacksRef.current?.onLeave) {
            scrollCallbacksRef.current.onLeave();
          }
          if (isPlayingRef.current && controllerRef.current) {
            controllerRef.current.pause();
          }
        },
        onEnterBack: () => {
          console.log(`Scene ${id}: Enter Back`);
          setCurrentScene(id);
          if (scrollCallbacksRef.current?.onEnterBack) {
            scrollCallbacksRef.current.onEnterBack();
          }
          if (!isScrolling && isInitialized) {
            requestAnimationFrame(() => handleSnapping('enterBack'));
          }
        },
        onLeaveBack: () => {
          console.log(`Scene ${id}: Leave Back`);
          if (scrollCallbacksRef.current?.onLeaveBack) {
            scrollCallbacksRef.current.onLeaveBack();
          }
          if (isPlayingRef.current && controllerRef.current) {
            controllerRef.current.pause();
          }
        }
      });

      ScrollTrigger.refresh();

      return () => {
        trigger.kill();
        ScrollTrigger.scrollerProxy(document.documentElement, {});
        ScrollTrigger.refresh();
      };
    }, [isInitialized, id, isScrolling]);

    // Touch Event Handler
    useEffect(() => {
      if (!containerRef.current || !options.handleTouch) return;

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
          if (isPlayingRef.current && controllerRef.current) {
            controllerRef.current.pause();
          } else if (controllerRef.current) {
            controllerRef.current.play();
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
    }, [options.handleTouch]);

    return (
      <div ref={containerRef} className={`scene scene-${id}`}>
        <WrappedComponent
          {...(rest as P)}
          id={id}
          onComplete={onComplete}
          controller={controllerRef.current}
        />
      </div>
    );
  };
};

export default withSceneControl; 