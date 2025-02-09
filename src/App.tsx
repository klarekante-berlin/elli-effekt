import React, { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import WelcomePage from './components/WelcomePage';
import AudioScene from './components/AudioScene';
import VideoScene from './components/VideoScene';
import ChatScene from './components/ChatScene';
import AvocadoScene from './components/AvocadoScene';
import BackgroundTexture from './components/BackgroundTexture';
import Section from './components/Section';
import { useSceneStore } from './stores/sceneStore';
import { useBaseStore } from './stores/baseStore';
import { useVideoStore } from './stores/videoStore';
import { useRootStore } from './stores/rootStore';
import './styles/global.css';
import videoSource from './assets/videos/WhatIf_Screen_002_Video.mp4';

const SCROLL_SETTINGS = {
  duration: 1.5,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
};

interface ScrollProps {
  scroll: number;
  velocity: number;
}

const App: React.FC = () => {
  const { isScrolling, setIsScrolling, isAnimationScene } = useBaseStore();
  const { currentScene } = useSceneStore();
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

  // Scroll Handler mit useLenis
  const lenis = useLenis(({ scroll, velocity }: ScrollProps) => {
    // Verhindere mehrfaches Auslösen während des programmatischen Scrollens
    if (isScrolling) return;

    // Wenn wir in einer Animations-Szene sind oder die Geschwindigkeit zu hoch ist, kein Snapping
    if (isAnimationScene || Math.abs(velocity) > 0.1) return;

    const sections = document.querySelectorAll('.section');
    const currentScrollPosition = scroll;
    
    // Finde die nächstgelegene Section
    let closestSection = null;
    let minDistance = Infinity;
    
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = currentScrollPosition + rect.top;
      const distance = Math.abs(currentScrollPosition - sectionTop);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSection = section;
      }
    });
    
    // Wenn wir eine nahe Section gefunden haben und nicht genau darauf sind
    if (closestSection && minDistance > 50 && lenis) {
      setIsScrolling(true);
      lenis.scrollTo(closestSection, SCROLL_SETTINGS);
      
      // Reset isScrolling nach der Animation
      setTimeout(() => {
        setIsScrolling(false);
      }, SCROLL_SETTINGS.duration * 1000);
    }
  });

  // Event Listener für Scene Navigation
  useEffect(() => {
    if (!lenis) return;

    const handleScrollToScene = (event: CustomEvent) => {
      const { sceneId, withLock } = event.detail;
      
      if (withLock) {
        setIsScrolling(true);
      }
      
      lenis.scrollTo(`#${sceneId}`, SCROLL_SETTINGS);
      
      if (withLock) {
        setTimeout(() => {
          setIsScrolling(false);
        }, SCROLL_SETTINGS.duration * 1000);
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
    <ReactLenis root>
      <BackgroundTexture />
      <div className="App">
        <Section height="100vh">
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
