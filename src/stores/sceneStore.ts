import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { useBaseStore } from './baseStore';
import { useScrollStore } from './scrollStore';


export type SceneId = 
  | 'welcome-scene'
  | 'audio-scene'
  | 'video-scene'
  | 'chat-scene'
  | 'avocado-scene'
  | null;

interface SceneState {
  currentScene: SceneId;
  previousScene: SceneId;
  sceneOrder: Exclude<SceneId, null>[];
  sceneStates: {
    [K in Exclude<SceneId, null>]: {
      isComplete: boolean;
      isActive: boolean;
      isReady: boolean;
      isAnimated: boolean;
      requiresSnapping: boolean;
    };
  };
  isInitialized: boolean;
  isScrolling: boolean;
}

interface SceneActions {
  scrollToScene: (sceneId: SceneId) => void;
  scrollToNextScene: () => void;
  setCurrentScene: (sceneId: SceneId) => void;
  markSceneAsComplete: (sceneId: SceneId) => void;
  markSceneAsActive: (sceneId: SceneId) => void;
  markSceneAsReady: (sceneId: SceneId) => void;
  markSceneAsAnimated: (sceneId: SceneId, isAnimated: boolean) => void;
  setSceneSnapping: (sceneId: SceneId, requiresSnapping: boolean) => void;
  resetScene: (sceneId: SceneId) => void;
  initialize: () => void;
  setIsScrolling: (isScrolling: boolean) => void;
}

const initialState: SceneState = {
  currentScene: null,
  previousScene: null,
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
      isAnimated: false,
      requiresSnapping: true
    },
    'audio-scene': {
      isComplete: false,
      isActive: false,
      isReady: false,
      isAnimated: false,
      requiresSnapping: true
    },
    'video-scene': {
      isComplete: false,
      isActive: false,
      isReady: false,
      isAnimated: false,
      requiresSnapping: true
    },
    'chat-scene': {
      isComplete: false,
      isActive: false,
      isReady: false,
      isAnimated: false,
      requiresSnapping: true
    },
    'avocado-scene': {
      isComplete: false,
      isActive: false,
      isReady: false,
      isAnimated: true,
      requiresSnapping: false
    }
  },
  isInitialized: false,
  isScrolling: false
};

export const useSceneStore = create<SceneState & SceneActions>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        ...initialState,

        scrollToScene: (sceneId) => {
          if (!sceneId) return;
          
          const { setIsScrolling } = useBaseStore.getState();
          const { setSnappingEnabled } = useScrollStore.getState();
          const currentState = get();
          const targetScene = currentState.sceneStates[sceneId];

          if (!targetScene) return;

          // Setze Snapping basierend auf Scene-Konfiguration
          setSnappingEnabled(targetScene.requiresSnapping);
          
          // Setze Animation-Status
          if (targetScene.isAnimated) {
            useBaseStore.getState().setIsAnimationScene(true);
            window.dispatchEvent(new CustomEvent('scrollToScene', { 
              detail: { sceneId, withLock: false } 
            }));
          } else {
            useBaseStore.getState().setIsAnimationScene(false);
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
          const currentState = get();
          const previousScene = currentState.currentScene;
          
          set({ 
            currentScene: sceneId,
            previousScene
          });

          if (!sceneId) return;

          const targetScene = currentState.sceneStates[sceneId];
          if (!targetScene) return;

          // Update scene states
          const updatedSceneStates = { ...currentState.sceneStates };
          Object.keys(updatedSceneStates).forEach((key) => {
            if (updatedSceneStates[key as Exclude<SceneId, null>]) {
              updatedSceneStates[key as Exclude<SceneId, null>]!.isActive = key === sceneId;
            }
          });
          set({ sceneStates: updatedSceneStates });

          // Update global states
          const { setIsAnimationScene } = useBaseStore.getState();
          const { setSnappingEnabled } = useScrollStore.getState();
          
          setIsAnimationScene(targetScene.isAnimated);
          setSnappingEnabled(targetScene.requiresSnapping);
        },

        markSceneAsComplete: (sceneId) => {
          if (!sceneId) return;
          
          const currentState = get();
          const sceneState = currentState.sceneStates[sceneId];
          
          if (!sceneState) return;

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
          if (!sceneState.isAnimated && sceneState.requiresSnapping) {
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

          // Update global animation state
          useBaseStore.getState().setIsAnimationScene(isAnimated);
        },

        setSceneSnapping: (sceneId, requiresSnapping) => {
          if (!sceneId) return;
          
          set((state) => ({
            sceneStates: {
              ...state.sceneStates,
              [sceneId]: {
                ...state.sceneStates[sceneId]!,
                requiresSnapping
              }
            }
          }));

          // Update global snapping state if this is the current scene
          const currentScene = get().currentScene;
          if (currentScene === sceneId) {
            useScrollStore.getState().setSnappingEnabled(requiresSnapping);
          }
        },

        resetScene: (sceneId) => {
          if (!sceneId) return;
          
          const currentState = get();
          const sceneState = currentState.sceneStates[sceneId];
          
          if (!sceneState) return;

          set((state) => ({
            sceneStates: {
              ...state.sceneStates,
              [sceneId]: {
                ...state.sceneStates[sceneId]!,
                isComplete: false,
                isActive: false,
                isReady: false,
                // Behalte Animation und Snapping Einstellungen bei
                isAnimated: sceneState.isAnimated,
                requiresSnapping: sceneState.requiresSnapping
              }
            }
          }));
        },

        initialize: () => {
          if (get().isInitialized) return;
          
          // Setze initiale Szene korrekt über set-Methode
          set((state) => ({
            isInitialized: true,
            sceneStates: {
              ...state.sceneStates,
              'welcome-scene': {
                ...state.sceneStates['welcome-scene']!,
                isReady: true,
                isActive: true
              }
            }
          }));
        },

        setIsScrolling: (isScrolling) => {
          set((state) => ({
            ...state,
            isScrolling
          }));

          // Synchronisiere mit dem globalen Scroll-Status im Base Store
          useBaseStore.getState().setIsScrolling(isScrolling);
        }
      })),
      {
        name: 'scene-store',
        partialize: (state) => ({ 
          currentScene: state.currentScene,
          previousScene: state.previousScene,
          sceneStates: state.sceneStates,
          isInitialized: state.isInitialized
        })
      }
    )
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

export const useSceneRequiresSnapping = (sceneId: Exclude<SceneId, null>): boolean =>
  useSceneStore((state) => state.sceneStates[sceneId]?.requiresSnapping ?? true);

export const usePreviousScene = (): SceneId =>
  useSceneStore((state) => state.previousScene); 