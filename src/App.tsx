import React from 'react';
import { ReactLenis } from 'lenis/react';
import BackgroundTexture from './components/BackgroundTexture';
import { SceneProvider } from './context/SceneContext';
import PlaceholderScene from './components/PlaceholderScene';
import { Scene } from './components/Scene';
import VideoScene from './components/VideoScene';
import WelcomePage from './components/WelcomePage';
import AudioScene from './components/AudioScene';
import ChatScene from './components/ChatScene';
import AvocadoScene from './components/AvocadoScene';
import scene2Video from './assets/videos/scene_02.mp4';
import scene4Video from './assets/videos/scene_04.mp4';
import scene6Video from './assets/videos/scene_06.mp4';

// First define the scenes configuration
const SCENES = [
  { id: 'welcome', component: WelcomePage, props: { onStart: () => console.log('Start clicked') }, snapIntoPlace: true },
  { id: 'scene-1', component: AudioScene, snapIntoPlace: true },
  { id: 'scene-2', component: VideoScene, props: { videoSource: scene2Video }, snapIntoPlace: true },
  { id: 'scene-3', component: ChatScene, snapIntoPlace: true },
  { id: 'scene-4', component: VideoScene, props: { videoSource: scene4Video }, snapIntoPlace: true },
  { id: 'scene-5', component: AvocadoScene, snapIntoPlace: true, isScrollable: true },
  { id: 'scene-6', component: VideoScene, props: { videoSource: scene6Video }, snapIntoPlace: true  },
  { id: 'scene-67', component: PlaceholderScene, props: { text: "Dies ist Scene 5 mit Snapping-Verhalten" }, snapIntoPlace: true }
] as Array<{
  id: string;
  component: React.ComponentType<any>;
  props?: any;
  snapIntoPlace?: boolean;
  isScrollable?: boolean;
}>;

// Create type from the scenes configuration
export type SceneId = typeof SCENES[number]['id'] | null;

const App: React.FC = () => {
  return (
    <ReactLenis root options={{ duration: 1.2, orientation: 'vertical', smoothWheel: true }}>
      <BackgroundTexture />
      <div className="App">
        <SceneProvider scenes={SCENES}>
          {SCENES.map(({ id, component: Component, props = {}, snapIntoPlace, isScrollable }) => (
            <Scene 
              key={id}
              id={id}
              snapIntoPlace={snapIntoPlace}
              isScrollable={isScrollable}
            >
              <Component {...props} />
            </Scene>
          ))}
        </SceneProvider>
      </div>
    </ReactLenis>
  );
};

export default App;
