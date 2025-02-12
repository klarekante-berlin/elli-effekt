import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SceneId } from '../context/AppContext';
import { useSceneState } from './useSceneState';

gsap.registerPlugin(ScrollTrigger);

export interface SceneAnimationController {
  play: () => void;
  pause: () => void;
  reset: () => void;
  cleanup: () => void;
}

interface SceneAnimationOptions {
  autoStart?: boolean;
  scrollTriggerOptions?: {
    start?: string;
    end?: string;
    markers?: boolean;
  };
  handleTouch?: boolean;
  onComplete?: () => void;
}

export const useSceneAnimation = (
  sceneId: SceneId,
  containerRef: React.RefObject<HTMLDivElement>,
  options: SceneAnimationOptions = {}
) => {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const { updateSceneState } = useSceneState(sceneId);

  const controller: SceneAnimationController = {
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

  useEffect(() => {
    if (!containerRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: options.scrollTriggerOptions?.start || 'top center',
      end: options.scrollTriggerOptions?.end || 'bottom center',
      markers: options.scrollTriggerOptions?.markers || false,
      onEnter: () => {
        updateSceneState({ isActive: true });
      },
      onLeave: () => {
        updateSceneState({ isActive: false });
      },
      onEnterBack: () => {
        updateSceneState({ isActive: true });
      },
      onLeaveBack: () => {
        updateSceneState({ isActive: false });
      }
    });

    if (options.handleTouch) {
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
      };
    }

    return () => {
      trigger.kill();
      controller.cleanup();
    };
  }, [containerRef, options, controller, updateSceneState]);

  useEffect(() => {
    if (options.autoStart) {
      controller.play();
    }
  }, [options.autoStart, controller]);

  return {
    controller,
    isPlaying: isPlayingRef.current
  };
}; 