import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useSceneStore, SceneId } from '../stores/sceneStore';
import { useInitializeStore } from '../hooks/useInitializeStore';

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
    const isInitialized = useInitializeStore();
    const { 
      isScrolling, 
      setIsScrolling, 
      setCurrentScene,
      sceneStates,
      currentScene,
      previousScene 
    } = useSceneStore();

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

      let scrollCallbacks: ScrollCallbacks | void;
      if (options.setupScene) {
        scrollCallbacks = options.setupScene(props, controller);
      }

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

        if (shouldSnap && containerRef.current && isInitialized) {
          const element = containerRef.current;
          const elementRect = element.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetY = scrollTop + elementRect.top;

          // Setze isScrolling während des Snappings
          setIsScrolling(true);

          // Berechne die Scroll-Richtung
          const currentScroll = window.pageYOffset;
          const scrollDirection = direction === 'enter' ? 'down' : 'up';
          
          console.log(`Scene ${id}: Snapping`, {
            targetY,
            currentScroll,
            direction: scrollDirection,
            elementTop: elementRect.top
          });

          // Stoppe alle laufenden GSAP Animationen
          gsap.killTweensOf(window);

          gsap.to(window, {
            duration: 0.5,
            scrollTo: { 
              y: targetY, 
              autoKill: false
            },
            ease: "power2.inOut",
            onStart: () => {
              console.log(`Scene ${id}: Snap Start`);
            },
            onUpdate: () => {
              // Verhindere weiteres Scrollen während des Snappings
              if (window.pageYOffset !== targetY) {
                window.scrollTo(0, targetY);
              }
            },
            onComplete: () => {
              console.log(`Scene ${id}: Snap Complete`);
              // Verzögere das Zurücksetzen des isScrolling-States
              setTimeout(() => {
                setIsScrolling(false);
                // Nur automatisch starten, wenn es keine Video-Szene ist oder wenn autoStart aktiv ist
                const shouldAutoStart = id !== 'video-scene' || (autoStart && !isScrolling);
                if (shouldAutoStart) {
                  controller.play();
                }
              }, 100);
            }
          });
        }
      };

      // ScrollTrigger Setup
      if (options.handleScroll && containerRef.current) {
        const trigger = ScrollTrigger.create({
          trigger: containerRef.current,
          start: scrollTriggerOptions.start || 'top center',
          end: scrollTriggerOptions.end || 'bottom center',
          markers: scrollTriggerOptions.markers || false,
          onEnter: () => {
            console.log(`Scene ${id}: Enter`, {
              isScrolling,
              requiresSnapping: sceneStates[id]?.requiresSnapping,
              previousScene,
              isInitialized
            });
            
            setCurrentScene(id);
            if (scrollCallbacks?.onEnter) {
              scrollCallbacks.onEnter();
            }
            
            // Verzögere das Snapping leicht, um sicherzustellen, dass der ScrollTrigger-Event abgeschlossen ist
            if (!isScrolling && isInitialized) {
              requestAnimationFrame(() => {
                handleSnapping('enter');
              });
            }
          },
          onLeave: () => {
            console.log(`Scene ${id}: Leave`, {
              isScrolling,
              isPlaying: isPlayingRef.current,
              isInitialized
            });
            
            if (scrollCallbacks?.onLeave) {
              scrollCallbacks.onLeave();
            }
            if (isPlayingRef.current) {
              controller.pause();
            }
          },
          onEnterBack: () => {
            console.log(`Scene ${id}: Enter Back`, {
              isScrolling,
              requiresSnapping: sceneStates[id]?.requiresSnapping,
              previousScene,
              isInitialized
            });
            
            setCurrentScene(id);
            if (scrollCallbacks?.onEnterBack) {
              scrollCallbacks.onEnterBack();
            }
            
            // Verzögere das Snapping leicht, um sicherzustellen, dass der ScrollTrigger-Event abgeschlossen ist
            if (!isScrolling && isInitialized) {
              requestAnimationFrame(() => {
                handleSnapping('enterBack');
              });
            }
          },
          onLeaveBack: () => {
            console.log(`Scene ${id}: Leave Back`, {
              isScrolling,
              isPlaying: isPlayingRef.current,
              isInitialized
            });
            
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
    }, [isInitialized]); // Nur neu erstellen, wenn isInitialized sich ändert

    // Auto-Start wenn aktiviert (aber nicht für Video-Szenen beim ersten Laden)
    useEffect(() => {
      if (!isInitialized) return;

      const shouldAutoStart = id !== 'video-scene' || (autoStart && !isScrolling);
      if (shouldAutoStart) {
        console.log(`Scene ${id}: Auto Start`, {
          isInitialized,
          isScrolling,
          autoStart
        });
        controllerRef.current?.play();
      }
    }, [autoStart, isScrolling, isInitialized]);

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