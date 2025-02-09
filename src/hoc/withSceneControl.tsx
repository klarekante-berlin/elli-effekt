import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useSceneStore } from '../stores/sceneStore';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Basis-Interface für alle Szenen
export interface BaseSceneProps {
  id: string;
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
    const { isScrolling, setIsScrolling, setCurrentScene } = useSceneStore();

    // Scene Controller Setup
    useEffect(() => {
      const controller: SceneController = {
        play: () => {
          if (!isPlayingRef.current && !isScrolling) {
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
      if (options.setupScene) {
        scrollCallbacks = options.setupScene(props, controller);
      }

      // ScrollTrigger Setup nur wenn handleScroll UND snapIntoPlace aktiv sind
      if (options.handleScroll && options.snapIntoPlace && containerRef.current) {
        const trigger = ScrollTrigger.create({
          trigger: containerRef.current,
          start: scrollTriggerOptions.start || 'top center',
          end: scrollTriggerOptions.end || 'bottom center',
          markers: scrollTriggerOptions.markers || false,
          onEnter: () => {
            setCurrentScene(id);
            if (scrollCallbacks?.onEnter) {
              scrollCallbacks.onEnter();
            }
            
            // Snap nur wenn snapIntoPlace true ist
            if (options.snapIntoPlace && containerRef.current) {
              const element = containerRef.current;
              const elementRect = element.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              const targetY = scrollTop + elementRect.top;

              gsap.to(window, {
                duration: 0.5,
                scrollTo: { y: targetY, autoKill: true },
                ease: "power2.inOut",
                onComplete: () => {
                  if (!isScrolling) {
                    controller.play();
                  }
                }
              });
            }
          },
          onLeave: () => {
            if (scrollCallbacks?.onLeave) {
              scrollCallbacks.onLeave();
            }
            if (isPlayingRef.current) {
              controller.pause();
            }
          },
          onEnterBack: () => {
            setCurrentScene(id);
            if (scrollCallbacks?.onEnterBack) {
              scrollCallbacks.onEnterBack();
            }
            
            // Snap nur wenn snapIntoPlace true ist
            if (options.snapIntoPlace && containerRef.current) {
              const element = containerRef.current;
              const elementRect = element.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              const targetY = scrollTop + elementRect.top;

              gsap.to(window, {
                duration: 0.5,
                scrollTo: { y: targetY, autoKill: true },
                ease: "power2.inOut",
                onComplete: () => {
                  if (!isScrolling) {
                    controller.play();
                  }
                }
              });
            }
          },
          onLeaveBack: () => {
            if (scrollCallbacks?.onLeaveBack) {
              scrollCallbacks.onLeaveBack();
            }
            if (isPlayingRef.current) {
              controller.pause();
            }
          }
        });

        return () => {
          trigger.kill();
          controller.cleanup();
          if (options.cleanupScene) {
            options.cleanupScene();
          }
        };
      }

      return () => {
        controller.cleanup();
        if (options.cleanupScene) {
          options.cleanupScene();
        }
      };
    }, []);

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
    }, []);

    // Auto-Start wenn aktiviert
    useEffect(() => {
      if (autoStart && !isScrolling) {
        controllerRef.current?.play();
      }
    }, [autoStart, isScrolling]);

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