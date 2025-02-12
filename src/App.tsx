import React from 'react';
import { ReactLenis } from 'lenis/react';
import BackgroundTexture from './components/BackgroundTexture';
import { AppProvider } from './context/AppContext';
import PlaceholderScene from './components/PlaceholderScene';
import { Scene } from './components/Scene';
import VideoScene from './components/VideoScene';
import WelcomePage from './components/WelcomePage';
import AudioScene from './components/AudioScene';
import ChatScene from './components/ChatScene';
import videoSource from './assets/videos/WhatIf_Screen_002_Video.mp4';

const App: React.FC = () => {
  const handleStart = () => {
    // Optional: Hier können wir zusätzliche Start-Logik implementieren
    console.log('Start clicked');
  };

  return (
    <AppProvider>
      <ReactLenis root options={{ duration: 1.2, orientation: 'vertical', smoothWheel: true }}>
        <BackgroundTexture />
        <div className="App">
            <Scene id="welcome" snapIntoPlace>
              <WelcomePage onStart={handleStart} />
            </Scene>

            <Scene id="scene-1" snapIntoPlace>
              <AudioScene />
            </Scene>

            <Scene id="scene-2" snapIntoPlace>
              <VideoScene videoSource={videoSource} />
            </Scene>

            <Scene id="scene-3" snapIntoPlace>
              <ChatScene />
            </Scene>

            <Scene id="scene-4" snapIntoPlace>
              <PlaceholderScene
                text="Dies ist Scene 4 mit Snapping-Verhalten"
              />
            </Scene>
        </div>
      </ReactLenis>
    </AppProvider>
  );
};

export default App;
