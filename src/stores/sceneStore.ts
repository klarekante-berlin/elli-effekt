import { create } from 'zustand';

interface SceneState {
  currentScene: string;
  sceneOrder: string[];
  scrollToScene: (sceneId: string) => void;
  scrollToNextScene: () => void;
  setCurrentScene: (sceneId: string) => void;
  onSceneComplete: (sceneId: string) => void;
  isScrolling: boolean;
  setIsScrolling: (scrolling: boolean) => void;
}

export const useSceneStore = create<SceneState>((set, get) => ({
  currentScene: 'welcome-scene',
  sceneOrder: [
    'welcome-scene',
    'audio-scene',
    'video-scene',
    'chat-scene',
    'final-video-scene'
  ],
  isScrolling: false,

  scrollToScene: (sceneId: string) => {
    set({ isScrolling: true });
    // Die eigentliche Scroll-Funktion wird in der App.tsx implementiert
    // und über einen Event-Listener aufgerufen
    window.dispatchEvent(new CustomEvent('scrollToScene', { 
      detail: { sceneId } 
    }));
  },

  scrollToNextScene: () => {
    const { currentScene, sceneOrder } = get();
    const currentIndex = sceneOrder.indexOf(currentScene);
    if (currentIndex < sceneOrder.length - 1) {
      const nextScene = sceneOrder[currentIndex + 1];
      get().scrollToScene(nextScene);
    }
  },

  setCurrentScene: (sceneId: string) => {
    set({ currentScene: sceneId });
  },

  onSceneComplete: (sceneId: string) => {
    const { currentScene, sceneOrder } = get();
    if (sceneId === currentScene) {
      get().scrollToNextScene();
    }
  },

  setIsScrolling: (scrolling: boolean) => {
    set({ isScrolling: scrolling });
  }
})); 