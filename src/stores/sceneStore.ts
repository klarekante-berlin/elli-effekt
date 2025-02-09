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

// Neue Typen für Szenen-Konfiguration
export type SceneType = 
  | 'static'        // Normale Szene mit optionalem Snapping
  | 'scroll'        // Szene mit Scroll-Animationen (kein Snapping)
  | 'interactive'   // Interaktive Szene (z.B. Video, Audio)
  | 'transition';   // Übergangsszene

interface SceneConfig {
  type: SceneType;
  allowSnapping: boolean;
  preserveScrollPosition: boolean;
  hasScrollTimeline: boolean;
}

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
      config: SceneConfig;
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
      requiresSnapping: true,
      config: {
        type: 'static',
        allowSnapping: true,
        preserveScrollPosition: false,
        hasScrollTimeline: false
      }
    },
    'audio-scene': {
      isComplete: false,
      isActive: false,
      isReady: false,
      isAnimated: false,
      requiresSnapping: true,
      config: {
        type: 'interactive',
        allowSnapping: true,
        preserveScrollPosition: false,
        hasScrollTimeline: false
      }
    },
    'video-scene': {
      isComplete: false,
      isActive: false,
      isReady: false,
      isAnimated: false,
      requiresSnapping: true,
      config: {
        type: 'interactive',
        allowSnapping: true,
        preserveScrollPosition: false,
        hasScrollTimeline: false
      }
    },
    'chat-scene': {
      isComplete: false,
      isActive: false,
      isReady: false,
      isAnimated: false,
      requiresSnapping: true,
      config: {
        type: 'static',
        allowSnapping: true,
        preserveScrollPosition: false,
        hasScrollTimeline: false
      }
    },
    'avocado-scene': {
      isComplete: false,
      isActive: false,
      isReady: false,
      isAnimated: true,
      requiresSnapping: false,
      config: {
        type: 'scroll',
        allowSnapping: false,
        preserveScrollPosition: true,
        hasScrollTimeline: true
      }
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
          const previousScene = currentState.currentScene;

          if (!targetScene) return;

          console.log(`Store: Scrolling to scene ${sceneId}`, {
            from: previousScene || 'initial',
            to: sceneId,
            sceneType: targetScene.config.type,
            allowSnapping: targetScene.config.allowSnapping,
            hasScrollTimeline: targetScene.config.hasScrollTimeline,
            currentScrolling: currentState.isScrolling
          });

          // Erweiterte Snapping-Logik basierend auf Szenen-Typ
          const shouldEnableSnapping = 
            targetScene.config.allowSnapping && 
            !targetScene.config.hasScrollTimeline &&
            targetScene.requiresSnapping;
          
          console.log('Store: Snapping decision:', {
            shouldEnableSnapping,
            reason: targetScene.config.type === 'scroll'
              ? 'Scroll animation scene - snapping disabled'
              : shouldEnableSnapping 
                ? 'Scene allows snapping'
                : 'Snapping disabled by configuration',
            sceneType: targetScene.config.type
          });
          
          // Setze Snapping-Status
          setSnappingEnabled(shouldEnableSnapping);
          
          // Setze Animation-Status und dispatche Event
          const eventDetail = {
            sceneId,
            withLock: !targetScene.isAnimated && shouldEnableSnapping,
            enableSnapping: shouldEnableSnapping,
            preserveScrollPosition: targetScene.config.preserveScrollPosition,
            isAnimated: targetScene.isAnimated,
            previousScene,
            timestamp: Date.now()
          };

          useBaseStore.getState().setIsAnimationScene(targetScene.isAnimated);
          
          // Nur scrollen, wenn wir nicht bereits scrollen oder wenn es ein erzwungener Übergang ist
          if (!currentState.isScrolling || shouldEnableSnapping) {
            console.log('Store: Initiating scroll with config:', eventDetail);
            setIsScrolling(true);
            window.dispatchEvent(new CustomEvent('scrollToScene', { detail: eventDetail }));
          } else {
            console.log('Store: Skipping scroll event due to active scrolling');
          }
        },

        scrollToNextScene: () => {
          const currentState = get();
          const { currentScene, sceneOrder, isScrolling } = currentState;
          const currentIndex = sceneOrder.indexOf(currentScene!);
          
          if (currentIndex < sceneOrder.length - 1) {
            const nextScene = sceneOrder[currentIndex + 1];
            const nextSceneState = currentState.sceneStates[nextScene];
            const currentSceneState = currentState.sceneStates[currentScene!];
            
            console.log('Store: Attempting to scroll to next scene:', {
              from: currentScene,
              to: nextScene,
              currentRequiresSnapping: currentSceneState?.requiresSnapping,
              nextIsAnimated: nextSceneState.isAnimated,
              isScrolling
            });
            
            // Zur nächsten Szene scrollen wenn:
            // 1. Die nächste Szene keine Animation hat ODER
            // 2. Die aktuelle Szene Snapping erfordert
            if (!nextSceneState.isAnimated || currentSceneState?.requiresSnapping) {
              console.log('Store: Scrolling to next scene:', nextScene);
              // Setze isScrolling zurück, um sicherzustellen, dass der Übergang stattfindet
              set({ isScrolling: false });
              get().scrollToScene(nextScene);
            } else {
              console.log('Store: Skipping automatic scroll to:', nextScene);
            }
          }
        },

        setCurrentScene: (sceneId) => {
          const currentState = get();
          const previousScene = currentState.currentScene;
          
          console.log('Store: Setting current scene:', {
            from: previousScene || 'initial',
            to: sceneId,
            isScrolling: currentState.isScrolling,
            timestamp: Date.now()
          });
          
          if (sceneId === previousScene) {
            console.log('Store: Scene already active, skipping update');
            return;
          }
          
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
          
          // Snapping-Status aktualisieren
          const isAvocadoScene = sceneId === 'avocado-scene';
          const isComingFromAvocado = previousScene === 'avocado-scene';
          
          const shouldEnableSnapping = !isAvocadoScene && (
            targetScene.requiresSnapping || 
            (isComingFromAvocado && currentState.sceneStates[sceneId]?.requiresSnapping)
          );
          
          setSnappingEnabled(shouldEnableSnapping);

          console.log('Store: Scene state updated:', {
            scene: sceneId,
            from: previousScene || 'initial',
            isAnimated: targetScene.isAnimated,
            requiresSnapping: targetScene.requiresSnapping,
            isAvocadoScene,
            isComingFromAvocado,
            snappingEnabled: shouldEnableSnapping
          });
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