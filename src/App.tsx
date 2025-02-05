import React, { useState } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import WelcomePage from './components/WelcomePage';
import AudioScene from './components/AudioScene';
import VideoScene from './components/VideoScene';
import BackgroundTexture from './components/BackgroundTexture';
import Section from './components/Section';
import './styles/global.css';

const App: React.FC = () => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const lenis = useLenis(({ scroll }) => {
    // Optional: Hier können wir auf Scroll-Events reagieren
  });

  const handleStart = () => {
    lenis?.scrollTo('#audio-scene', {
      duration: 1.5,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
  };

  const handleAudioComplete = () => {
    setIsVideoReady(true);
    lenis?.scrollTo('#video-scene', {
      duration: 1.5,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      onComplete: () => {
        // Optional: Hier können wir zusätzliche Aktionen nach dem Scrollen ausführen
      }
    });
  };

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
          <VideoScene isReadyToPlay={isVideoReady} />
        </Section>
      </div>
    </ReactLenis>
  );
};

export default App;
