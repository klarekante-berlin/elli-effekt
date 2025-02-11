import React from 'react';
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

const App: React.FC = () => {
  const lenis = useLenis();
  const { currentScene, navigateToScene } = useSceneNavigation(lenis);
  const { isScrolling, setIsScrolling, isAnimationScene, setIsAnimationScene } = useScrollSnapping(lenis);

  const handleStart = () => {
    navigateToScene('audio-scene');
  };

  const handleAudioComplete = () => {
    navigateToScene('video-scene');
  };

  const handleVideoComplete = () => {
    navigateToScene('chat-scene');
  };

  const handleChatComplete = () => {
    navigateToScene('avocado-scene');
  };

  return (
    <ReactLenis root>
      <BackgroundTexture />
      <div className="App">
        <Section height="100vh">
          <WelcomePage onStart={handleStart} />
        </Section>

        <Section height="100vh" id="audio-scene">
          <AudioScene 
            onAnimationComplete={handleAudioComplete}
            isAnimationScene={isAnimationScene}
            setIsAnimationScene={setIsAnimationScene}
          />
        </Section>

        <Section height="100vh" id="video-scene">
          <VideoScene 
            id="video-scene"
            videoSource={videoSource}
            isReadyToPlay={currentScene === 'video-scene'}
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
