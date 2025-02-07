import React, { useState, useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import WelcomePage from './components/WelcomePage';
import AudioScene from './components/AudioScene';
import VideoScene from './components/VideoScene';
import ChatScene from './components/ChatScene';
import AvocadoScene from './components/AvocadoScene';
import BackgroundTexture from './components/BackgroundTexture';
import Section from './components/Section';
import { useVideoStore } from './stores/videoStore';
import './styles/global.css';
import videoSource1 from './assets/videos/WhatIf_Screen_002_Video.mp4';
import videoSource2 from './assets/videos/WhatIf_Screen_004_Video.mp4';

const SCROLL_SETTINGS = {
  duration: 1.5,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
};

const App: React.FC = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const { setReadyToPlayFromAudio } = useVideoStore();
  
  const lenis = useLenis(({ scroll, velocity }) => {
    // Verhindere mehrfaches Auslösen während des programmatischen Scrollens
    if (isScrolling) return;

    // Wenn die Scroll-Geschwindigkeit fast null ist und wir nicht bereits scrollen
    if (Math.abs(velocity) < 0.1) {
      const sections = document.querySelectorAll('.section');
      const viewportHeight = window.innerHeight;
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
      if (closestSection && minDistance > 50) {
        setIsScrolling(true);
        lenis?.scrollTo(closestSection, SCROLL_SETTINGS);
        
        // Reset isScrolling nach der Animation
        setTimeout(() => {
          setIsScrolling(false);
        }, SCROLL_SETTINGS.duration * 1000);
      }
    }
  });

  const handleStart = () => {
    setIsScrolling(true);
    lenis?.scrollTo('#audio-scene', SCROLL_SETTINGS);
    setTimeout(() => {
      setIsScrolling(false);
    }, SCROLL_SETTINGS.duration * 1000);
  };

  const handleAudioComplete = () => {
    setReadyToPlayFromAudio(true);
    setIsScrolling(true);
    lenis?.scrollTo('#video-scene', SCROLL_SETTINGS);
    setTimeout(() => {
      setIsScrolling(false);
    }, SCROLL_SETTINGS.duration * 1000);
  };

  const handleVideoComplete = () => {
    setIsScrolling(true);
    lenis?.scrollTo('#avocado-scene', SCROLL_SETTINGS);
    setTimeout(() => {
      setIsScrolling(false);
    }, SCROLL_SETTINGS.duration * 1000);
  };

  const handleChatComplete = () => {
    setIsScrolling(true);
    lenis?.scrollTo('#final-video-scene', SCROLL_SETTINGS);
    setTimeout(() => {
      setIsScrolling(false);
    }, SCROLL_SETTINGS.duration * 1000);
  };

  const handleFinalVideoComplete = () => {
    setIsScrolling(true);
    lenis?.scrollTo('#avocado-scene', SCROLL_SETTINGS);
    setTimeout(() => {
      setIsScrolling(false);
    }, SCROLL_SETTINGS.duration * 1000);
  };

  return (
    <ReactLenis root options={{
      duration: 1.5,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      wheelMultiplier: 1,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
    }}>
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
            videoSource={videoSource1}
            isReadyToPlay={true}
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

        <Section height="100vh" id="final-video-scene">
          <VideoScene 
            id="final-video-scene"
            videoSource={videoSource2}
            isReadyToPlay={false}
            onComplete={handleFinalVideoComplete}
            showControls={true}
            loop={false}
            showFrame={true}
            startMuted={false}
          />
        </Section>

        <Section height="100vh" id="avocado-scene">
          <AvocadoScene 
            id="avocado-scene"
          />
        </Section>
      </div>
    </ReactLenis>
  );
};

export default App;
