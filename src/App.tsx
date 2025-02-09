import React, { useEffect, useCallback } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import type { LenisOptions } from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import WelcomePage from './components/WelcomePage';
import AudioScene from './components/AudioScene';
import VideoScene from './components/VideoScene';
import ChatScene from './components/ChatScene';
import AvocadoScene from './components/AvocadoScene';
import BackgroundTexture from './components/BackgroundTexture';
import Section from './components/Section';
import { useSceneStore, SceneId } from './stores/sceneStore';
import { useBaseStore } from './stores/baseStore';
import { useRootStore } from './stores/rootStore';
import './styles/global.css';
import videoSource from './assets/videos/WhatIf_Screen_002_Video.mp4';

// GSAP Plugins registrieren
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const SCROLL_SETTINGS = {
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
};

const LENIS_CONFIG: LenisOptions = {
  duration: 1.2,
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
  infinite: false,
  syncTouch: true,
  lerp: 0.1
};

interface ScrollProps {
  scroll: number;
  velocity: number;
}

const App: React.FC = () => {
  const { isScrolling, setIsScrolling } = useBaseStore();
  const { currentScene, sceneStates } = useSceneStore();
  const { isInitialized, initialize, hydrate } = useRootStore();
  
  // Initialisiere die Stores
  useEffect(() => {
    const initializeStores = async () => {
      if (!isInitialized) {
        await hydrate();
        await initialize();
      }
    };

    initializeStores();
  }, [isInitialized, initialize, hydrate]);

  // Lenis Hook
  const lenis = useLenis(({ scroll, velocity }: ScrollProps) => {
    // Verhindere Scrollen während Animation
    if (isScrolling) {
      return;
    }

    // Hohe Geschwindigkeit deaktiviert Snapping
    if (Math.abs(velocity) > 0.8) {
      return;
    }
  });

  // Zentrale Scroll-Funktion für konsistentes Verhalten
  const scrollToElement = useCallback((
    targetElement: HTMLElement,
    options: {
      isAvocadoScene?: boolean;
      preserveScrollPosition?: boolean;
      withSnapping?: boolean;
      onComplete?: () => void;
    } = {}
  ) => {
    const {
      isAvocadoScene = false,
      preserveScrollPosition = false,
      withSnapping = true,
      onComplete
    } = options;

    if (!targetElement || !lenis) return;

    setIsScrolling(true);

    if (isAvocadoScene || preserveScrollPosition) {
      // Direktes Scrollen ohne Animation
      lenis.scrollTo(targetElement, {
        offset: 0,
        duration: 0,
        immediate: true,
        onComplete: () => {
          setIsScrolling(false);
          onComplete?.();
        }
      });
    } else {
      // Berechne optimale Scroll-Position für zentriertes Snapping
      const elementRect = targetElement.getBoundingClientRect();
      const offset = withSnapping ? window.innerHeight / 2 - elementRect.height / 2 : 0;

      lenis.scrollTo(targetElement, {
        offset,
        duration: SCROLL_SETTINGS.duration,
        easing: SCROLL_SETTINGS.easing,
        immediate: false,
        onComplete: () => {
          setTimeout(() => {
            setIsScrolling(false);
            onComplete?.();
          }, 100);
        }
      });
    }
  }, [lenis, setIsScrolling]);

  // ScrollTrigger Setup für Snapping
  useEffect(() => {
    if (!isInitialized) return;

    const sections = document.querySelectorAll('.section');
    const triggers: ScrollTrigger[] = [];

    sections.forEach((section) => {
      const sceneId = section.id as SceneId;
      const sceneState = sceneStates[sceneId as Exclude<SceneId, null>];
      
      // Überspringe Avocado-Szene und Szenen ohne Snapping
      if (sceneId === 'avocado-scene' || !sceneState?.requiresSnapping) {
        return;
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive && !isScrolling) {
            console.log('ScrollTrigger: Scene toggle', {
              scene: sceneId,
              direction: self.direction,
              progress: self.progress
            });

            scrollToElement(section as HTMLElement, {
              withSnapping: true,
              onComplete: () => {
                const { scrollToScene } = useSceneStore.getState();
                scrollToScene(sceneId);
              }
            });
          }
        }
      });

      triggers.push(trigger);
    });

    return () => {
      triggers.forEach(trigger => trigger.kill());
    };
  }, [isInitialized, sceneStates, isScrolling, scrollToElement]);

  // Event Listener für Scene Navigation
  useEffect(() => {
    if (!lenis) return;

    const handleScrollToScene = (event: CustomEvent) => {
      const { sceneId, withLock, enableSnapping, preserveScrollPosition, previousScene } = event.detail;
      
      console.log('App: Handling scroll to scene', {
        from: previousScene || 'initial',
        to: sceneId,
        withLock,
        enableSnapping,
        preserveScrollPosition
      });

      const targetElement = document.querySelector(`#${sceneId}`) as HTMLElement;
      if (!targetElement) return;

      scrollToElement(targetElement, {
        isAvocadoScene: sceneId === 'avocado-scene',
        preserveScrollPosition,
        withSnapping: enableSnapping
      });
    };

    window.addEventListener('scrollToScene', handleScrollToScene as EventListener);
    return () => {
      window.removeEventListener('scrollToScene', handleScrollToScene as EventListener);
    };
  }, [lenis, scrollToElement]);

  const handleStart = () => {
    const { scrollToScene } = useSceneStore.getState();
    scrollToScene('audio-scene');
  };

  const handleAudioComplete = () => {
    const { scrollToScene } = useSceneStore.getState();
    scrollToScene('video-scene');
  };

  const handleVideoComplete = () => {
    const { scrollToScene } = useSceneStore.getState();
    scrollToScene('chat-scene');
  };

  const handleChatComplete = () => {
    const { scrollToScene } = useSceneStore.getState();
    scrollToScene('avocado-scene');
  };

  // Zeige Loading-State während der Initialisierung
  if (!isInitialized) {
    return <div className="loading">Initializing...</div>;
  }

  return (
    <ReactLenis root options={LENIS_CONFIG}>
      <BackgroundTexture />
      <div className="App">
        <Section height="100vh" id="welcome-scene">
          <WelcomePage onStart={handleStart} />
        </Section>

        <Section height="100vh" id="audio-scene">
          <AudioScene onAnimationComplete={handleAudioComplete} />
        </Section>

        <Section height="100vh" id="video-scene">
          <VideoScene 
            id="video-scene"
            videoSource={videoSource}
            isReadyToPlay={false}
            onComplete={handleVideoComplete}
            showControls={true}
            loop={false}
            showFrame={true}
            startMuted={false}
          />
        </Section>

        <Section height="100vh" id="chat-scene">
          <ChatScene onComplete={handleChatComplete} />
        </Section>

        <Section height="100vh" id="avocado-scene">
          <AvocadoScene id="avocado-scene" />
        </Section>
      </div>
    </ReactLenis>
  );
};

export default App;
