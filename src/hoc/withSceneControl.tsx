import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSceneStore } from '../stores/sceneStore';

gsap.registerPlugin(ScrollTrigger);

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
    const { isScrolling, setCurrentScene } = useSceneStore();

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

      // Setup der Szene mit dem Controller und hole ScrollTrigger Callbacks
      let scrollCallbacks: ScrollCallbacks | void;
      if (options.setupScene) {
        scrollCallbacks = options.setupScene(props, controller);
      }

      // ScrollTrigger Setup wenn handleScroll aktiviert ist
      if (options.handleScroll && containerRef.current) {
        const trigger = ScrollTrigger.create({
          trigger: containerRef.current,
          start: scrollTriggerOptions.start || 'top center',
          end: scrollTriggerOptions.end || 'bottom center',
          markers: scrollTriggerOptions.markers || false,
          onEnter: () => {
            if (!isScrolling) {
              setCurrentScene(id);
              if (scrollCallbacks?.onEnter) {
                scrollCallbacks.onEnter();
              }
              setTimeout(() => {
                if (!isScrolling) {
                  controller.play();
                }
              }, 100);
            }
          },
          onLeave: () => {
            if (!isScrolling && isPlayingRef.current) {
              if (scrollCallbacks?.onLeave) {
                scrollCallbacks.onLeave();
              }
              controller.pause();
            }
          },
          onEnterBack: () => {
            if (!isScrolling) {
              setCurrentScene(id);
              if (scrollCallbacks?.onEnterBack) {
                scrollCallbacks.onEnterBack();
              }
              setTimeout(() => {
                if (!isScrolling) {
                  controller.play();
                }
              }, 100);
            }
          },
          onLeaveBack: () => {
            if (!isScrolling && isPlayingRef.current) {
              if (scrollCallbacks?.onLeaveBack) {
                scrollCallbacks.onLeaveBack();
              }
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