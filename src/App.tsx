import React from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import WelcomePage from './components/WelcomePage';
import AudioScene from './components/AudioScene';
import BackgroundTexture from './components/BackgroundTexture';
import Section from './components/Section';
import './styles/global.css';

const App: React.FC = () => {
  const lenis = useLenis(({ scroll }) => {
    // Optional: Hier können wir auf Scroll-Events reagieren
  });

  const handleStart = () => {
    lenis?.scrollTo('#audio-scene', {
      duration: 1.5,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
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
          <AudioScene />
        </Section>
      </div>
    </ReactLenis>
  );
};

export default App;
