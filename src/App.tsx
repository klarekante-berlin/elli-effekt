import React, { useEffect } from 'react';
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
  syncTouch: true
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

            const { scrollToScene } = useSceneStore.getState();
            setIsScrolling(true);
            scrollToScene(sceneId);
          }
        }
      });

      triggers.push(trigger);
    });

    return () => {
      triggers.forEach(trigger => trigger.kill());
    };
  }, [isInitialized, sceneStates, isScrolling, setIsScrolling]);

  // Lenis Scroll Handler (nur für Basis-Funktionalität)
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

      setIsScrolling(true);
      
      const isAvocadoScene = sceneId === 'avocado-scene';
      const targetElement = document.querySelector(`#${sceneId}`) as HTMLElement;
      
      if (!targetElement) {
        setIsScrolling(false);
        return;
      }

      if (isAvocadoScene || preserveScrollPosition) {
        // Direktes Scrollen für Avocado oder wenn Position beibehalten werden soll
        lenis.scrollTo(targetElement, {
          offset: 0,
          duration: 0,
          immediate: true
        });
        setIsScrolling(false);
      } else {
        // GSAP Animation für alle anderen Szenen
        gsap.to(window, {
          duration: SCROLL_SETTINGS.duration,
          scrollTo: {
            y: targetElement,
            autoKill: false
          },
          ease: SCROLL_SETTINGS.easing,
          onComplete: () => {
            setTimeout(() => {
              setIsScrolling(false);
            }, 100);
          }
        });
      }
    };

    window.addEventListener('scrollToScene', handleScrollToScene as EventListener);
    return () => {
      window.removeEventListener('scrollToScene', handleScrollToScene as EventListener);
    };
  }, [lenis, setIsScrolling]);

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
