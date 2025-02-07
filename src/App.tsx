import React, { useState, useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import WelcomePage from './components/WelcomePage';
import AudioScene from './components/AudioScene';
import VideoScene from './components/VideoScene';
import ChatScene from './components/ChatScene';
import BackgroundTexture from './components/BackgroundTexture';
import Section from './components/Section';
import './styles/global.css';

const SCROLL_SETTINGS = {
  duration: 1.5,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
};

const App: React.FC = () => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  
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
    setIsVideoReady(true);
    setIsScrolling(true);
    lenis?.scrollTo('#video-scene', SCROLL_SETTINGS);
    setTimeout(() => {
      setIsScrolling(false);
    }, SCROLL_SETTINGS.duration * 1000);
  };

  const handleVideoComplete = () => {
    setIsScrolling(true);
    lenis?.scrollTo('#chat-scene', SCROLL_SETTINGS);
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
          <VideoScene isReadyToPlay={isVideoReady} onComplete={handleVideoComplete} />
        </Section>

        <Section height="100vh" id="chat-scene">
          <ChatScene />
        </Section>
      </div>
    </ReactLenis>
  );
};

export default App;
