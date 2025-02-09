import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { useBaseStore } from './baseStore';

export type SceneId = 
  | 'welcome-scene'
  | 'audio-scene'
  | 'video-scene'
  | 'chat-scene'
  | 'avocado-scene'
  | null;

interface SceneState {
  currentScene: SceneId;
  sceneOrder: SceneId[];
  sceneStates: {
    [K in Exclude<SceneId, null>]?: {
      isComplete: boolean;
      isActive: boolean;
      isReady: boolean;
      isAnimated: boolean;
    };
  };
}

interface SceneActions {
  scrollToScene: (sceneId: SceneId) => void;
  scrollToNextScene: () => void;
  setCurrentScene: (sceneId: SceneId) => void;
  markSceneAsComplete: (sceneId: SceneId) => void;
  markSceneAsActive: (sceneId: SceneId) => void;
  markSceneAsReady: (sceneId: SceneId) => void;
  markSceneAsAnimated: (sceneId: SceneId, isAnimated: boolean) => void;
  resetScene: (sceneId: SceneId) => void;
}

const initialState: SceneState = {
  currentScene: null,
  sceneOrder: [
    'welcome-scene',
    'audio-scene',
    'video-scene',
    'chat-scene',
    'avocado-scene'
  ],
  sceneStates: {
    'welcome-scene': {
      isComplete: false,
      isActive: false,
      isReady: true,
      isAnimated: false
    },
    'audio-scene': {
      isComplete: false,
      isActive: false,
      isReady: false,
      isAnimated: false
    },
    'video-scene': {
      isComplete: false,
      isActive: false,
      isReady: false,
      isAnimated: false
    },
    'chat-scene': {
      isComplete: false,
      isActive: false,
      isReady: false,
      isAnimated: false
    },
    'avocado-scene': {
      isComplete: false,
      isActive: false,
      isReady: false,
      isAnimated: true
    }
  }
};

export const useSceneStore = create<SceneState & SceneActions>()(
  subscribeWithSelector(
    devtools((set, get) => ({
      ...initialState,

      scrollToScene: (sceneId) => {
        if (!sceneId) return;
        
        const { setIsScrolling } = useBaseStore.getState();
        const currentState = get();
        const targetScene = currentState.sceneStates[sceneId];

        // Wenn die Zielszene eine animierte Szene ist, kein Scroll-Lock
        if (targetScene?.isAnimated) {
          window.dispatchEvent(new CustomEvent('scrollToScene', { 
            detail: { sceneId, withLock: false } 
          }));
        } else {
          setIsScrolling(true);
          window.dispatchEvent(new CustomEvent('scrollToScene', { 
            detail: { sceneId, withLock: true } 
          }));
        }
      },

      scrollToNextScene: () => {
        const { currentScene, sceneOrder } = get();
        const currentIndex = sceneOrder.indexOf(currentScene!);
        if (currentIndex < sceneOrder.length - 1) {
          const nextScene = sceneOrder[currentIndex + 1];
          get().scrollToScene(nextScene);
        }
      },

      setCurrentScene: (sceneId) => {
        const { setIsAnimationScene } = useBaseStore.getState();
        const currentState = get();
        
        set({ currentScene: sceneId });
        
        if (sceneId && currentState.sceneStates[sceneId]?.isAnimated) {
          setIsAnimationScene(true);
        } else {
          setIsAnimationScene(false);
        }

        // Markiere die aktuelle Szene als aktiv und alle anderen als inaktiv
        if (sceneId) {
          const updatedSceneStates = { ...currentState.sceneStates };
          Object.keys(updatedSceneStates).forEach((key) => {
            if (updatedSceneStates[key as Exclude<SceneId, null>]) {
              updatedSceneStates[key as Exclude<SceneId, null>]!.isActive = key === sceneId;
            }
          });
          set({ sceneStates: updatedSceneStates });
        }
      },

      markSceneAsComplete: (sceneId) => {
        if (!sceneId) return;
        
        set((state) => ({
          sceneStates: {
            ...state.sceneStates,
            [sceneId]: {
              ...state.sceneStates[sceneId]!,
              isComplete: true
            }
          }
        }));

        // Automatisch zur nächsten Szene scrollen, außer bei animierten Szenen
        const currentState = get();
        if (!currentState.sceneStates[sceneId]?.isAnimated) {
          get().scrollToNextScene();
        }
      },

      markSceneAsActive: (sceneId) => {
        if (!sceneId) return;
        
        set((state) => ({
          sceneStates: {
            ...state.sceneStates,
            [sceneId]: {
              ...state.sceneStates[sceneId]!,
              isActive: true
            }
          }
        }));
      },

      markSceneAsReady: (sceneId) => {
        if (!sceneId) return;
        
        set((state) => ({
          sceneStates: {
            ...state.sceneStates,
            [sceneId]: {
              ...state.sceneStates[sceneId]!,
              isReady: true
            }
          }
        }));
      },

      markSceneAsAnimated: (sceneId, isAnimated) => {
        if (!sceneId) return;
        
        set((state) => ({
          sceneStates: {
            ...state.sceneStates,
            [sceneId]: {
              ...state.sceneStates[sceneId]!,
              isAnimated
            }
          }
        }));
      },

      resetScene: (sceneId) => {
        if (!sceneId) return;
        
        const isAnimated = get().sceneStates[sceneId]?.isAnimated || false;
        
        set((state) => ({
          sceneStates: {
            ...state.sceneStates,
            [sceneId]: {
              isComplete: false,
              isActive: false,
              isReady: false,
              isAnimated // Behalte den Animation-Status bei
            }
          }
        }));
      }
    }))
  )
);

// Selektoren
export const useSceneState = (sceneId: Exclude<SceneId, null>) => 
  useSceneStore((state) => state.sceneStates[sceneId]);

export const useIsSceneActive = (sceneId: Exclude<SceneId, null>): boolean =>
  useSceneStore((state) => state.sceneStates[sceneId]?.isActive ?? false);

export const useIsSceneComplete = (sceneId: Exclude<SceneId, null>): boolean =>
  useSceneStore((state) => state.sceneStates[sceneId]?.isComplete ?? false);

export const useIsSceneReady = (sceneId: Exclude<SceneId, null>): boolean =>
  useSceneStore((state) => state.sceneStates[sceneId]?.isReady ?? false);

export const useIsSceneAnimated = (sceneId: Exclude<SceneId, null>): boolean =>
  useSceneStore((state) => state.sceneStates[sceneId]?.isAnimated ?? false); 