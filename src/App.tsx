import React, { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import WelcomePage from './components/WelcomePage';
import AudioScene from './components/AudioScene';
import VideoScene from './components/VideoScene';
import ChatScene from './components/ChatScene';
import AvocadoScene from './components/AvocadoScene';
import BackgroundTexture from './components/BackgroundTexture';
import Section from './components/Section';
import { useSceneNavigation } from './hooks/useSceneNavigation';
import { useScrollSnapping } from './hooks/useScrollSnapping';
import videoSource from './assets/videos/WhatIf_Screen_002_Video.mp4';
import { AppProvider } from './context/AppContext';

const App: React.FC = () => {
  const lenis = useLenis();
  const { currentScene, navigateToScene, isTransitioning } = useSceneNavigation(lenis);
  const { isScrolling, setIsScrolling, isAnimationScene, setIsAnimationScene } = useScrollSnapping(lenis);

  // Synchronisiere Lenis-Zustand mit Szenen
  useEffect(() => {
    if (!lenis) return;

    // @ts-ignore - Lenis Typen sind nicht vollständig
    lenis.setScroll({ enabled: !isTransitioning && !isAnimationScene });
  }, [lenis, isTransitioning, isAnimationScene]);

  const handleStart = () => {
    setIsAnimationScene(true);
    navigateToScene('audio-scene');
  };

  const handleAudioComplete = () => {
    setIsAnimationScene(false);
    navigateToScene('video-scene');
  };

  const handleVideoComplete = () => {
    setIsAnimationScene(false);
    navigateToScene('chat-scene');
  };

/*   const handleChatComplete = () => {
    setIsAnimationScene(false);
    navigateToScene('avocado-scene');
  }; */

  return (
    <AppProvider>
      <ReactLenis root options={{ duration: 1.2, orientation: 'vertical', smoothWheel: true }}>
        <BackgroundTexture />
        <div className="App">
          <Section height="100vh" id="welcome">
            <WelcomePage onStart={handleStart} />
          </Section>

          <Section height="100vh" id="audio-scene">
            <AudioScene 
              id="audio-scene"
              onAnimationComplete={handleAudioComplete}
              isAnimationScene={isAnimationScene}
              setIsAnimationScene={setIsAnimationScene}
              isActive={currentScene === 'audio-scene' && !isTransitioning}
            />
          </Section>

          <Section height="100vh" id="video-scene">
            <VideoScene 
              id="video-scene"
              videoSource={videoSource}
              isReadyToPlay={currentScene === 'video-scene' && !isTransitioning}
              onComplete={handleVideoComplete}
              showControls={true}
              loop={false}
              showFrame={true}
              startMuted={false}
              isActive={currentScene === 'video-scene' && !isTransitioning}
            />
          </Section>

          <Section height="100vh" id="chat-scene">
            <ChatScene 
              id="chat-scene"
              //onComplete={handleChatComplete} 
              isActive={currentScene === 'chat-scene' && !isTransitioning}
            />
          </Section>

          <Section height="100vh" id="avocado-scene">
            <AvocadoScene 
              id="avocado-scene"
              isActive={currentScene === 'avocado-scene' && !isTransitioning}
            />
          </Section>
        </div>
      </ReactLenis>
    </AppProvider>
  );
};

export default App;
