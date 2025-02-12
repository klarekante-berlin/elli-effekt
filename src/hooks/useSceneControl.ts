import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp, SceneId } from '../context/AppContext';

gsap.registerPlugin(ScrollTrigger);

export interface SceneController {
  play: () => void;
  pause: () => void;
  reset: () => void;
  cleanup: () => void;
}

export interface SceneControlOptions {
  id: SceneId;
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
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const { dispatch } = useApp();

  // Controller Setup
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

  // Scene Setup
  useEffect(() => {
    if (!containerRef.current) return;

    // Update Scene State
    dispatch({
      type: 'UPDATE_SCENE_STATE',
      payload: {
        sceneId: id,
        updates: { 
          requiresSnapping: snapIntoPlace,
          isReady: true
        }
      }
    });

    // ScrollTrigger Setup
    const scrollCallbacks = setupScene?.(controller);
    
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: scrollTriggerOptions.start || 'top center',
      end: scrollTriggerOptions.end || 'bottom center',
      markers: scrollTriggerOptions.markers || false,
      onEnter: () => {
        dispatch({
          type: 'UPDATE_SCENE_STATE',
          payload: {
            sceneId: id,
            updates: { isActive: true }
          }
        });
        scrollCallbacks?.onEnter?.();
      },
      onLeave: () => {
        dispatch({
          type: 'UPDATE_SCENE_STATE',
          payload: {
            sceneId: id,
            updates: { isActive: false }
          }
        });
        scrollCallbacks?.onLeave?.();
      },
      onEnterBack: () => {
        dispatch({
          type: 'UPDATE_SCENE_STATE',
          payload: {
            sceneId: id,
            updates: { isActive: true }
          }
        });
        scrollCallbacks?.onEnterBack?.();
      },
      onLeaveBack: () => {
        dispatch({
          type: 'UPDATE_SCENE_STATE',
          payload: {
            sceneId: id,
            updates: { isActive: false }
          }
        });
        scrollCallbacks?.onLeaveBack?.();
      }
    });

    // Touch Event Handler
    if (handleTouch) {
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
            controller.pause();
          } else {
            controller.play();
          }
        }
      };

      containerRef.current.addEventListener('touchstart', handleTouchStart);
      containerRef.current.addEventListener('touchend', handleTouchEnd);

      return () => {
        containerRef.current?.removeEventListener('touchstart', handleTouchStart);
        containerRef.current?.removeEventListener('touchend', handleTouchEnd);
        trigger.kill();
        controller.cleanup();
        cleanupScene?.();
      };
    }

    return () => {
      trigger.kill();
      controller.cleanup();
      cleanupScene?.();
    };
  }, [id, snapIntoPlace, handleTouch, scrollTriggerOptions, setupScene, cleanupScene, controller, dispatch]);

  // Auto-Start
  useEffect(() => {
    if (autoStart) {
      controller.play();
    }
  }, [autoStart, controller]);

  return {
    containerRef,
    controller,
    isPlaying: isPlayingRef.current
  };
}; 