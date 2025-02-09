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
          if (!sceneId) {
            console.error('Store: No scene ID provided');
            return;
          }
          
          const { setIsScrolling } = useBaseStore.getState();
          const { setSnappingEnabled } = useScrollStore.getState();
          const currentState = get();
          
          // Prüfe, ob die Szene existiert
          if (!currentState.sceneStates[sceneId]) {
            console.error(`Store: Scene ${sceneId} does not exist`);
            return;
          }

          const targetScene = currentState.sceneStates[sceneId];
          const previousScene = currentState.currentScene;
          const currentSceneState = previousScene ? currentState.sceneStates[previousScene] : null;

          // Sicherheitsprüfung für die Konfiguration
          if (!targetScene.config) {
            console.warn(`Store: Missing configuration for scene ${sceneId}, using defaults`);
            targetScene.config = {
              type: 'static',
              allowSnapping: true,
              preserveScrollPosition: false,
              hasScrollTimeline: false
            };
          }

          // Debug-Log für die Szenen-Konfiguration
          console.log(`Store: Scene transition request:`, {
            from: previousScene || 'initial',
            to: sceneId,
            targetConfig: targetScene.config,
            currentConfig: currentSceneState?.config,
            isAnimated: targetScene.isAnimated,
            requiresSnapping: targetScene.requiresSnapping,
            isComplete: currentSceneState?.isComplete
          });

          // Spezialbehandlung für die Avocado-Szene
          const isAvocadoScene = sceneId === 'avocado-scene';
          const isComingFromAvocado = previousScene === 'avocado-scene';
          const isComingFromInteractive = currentSceneState?.config?.type === 'interactive';

          // Erweiterte Snapping-Logik
          const shouldEnableSnapping = !isAvocadoScene && (
            // Normale Snapping-Regeln
            (targetScene.config.allowSnapping && targetScene.requiresSnapping) ||
            // Erzwungenes Snapping nach Avocado-Szene
            (isComingFromAvocado && targetScene.requiresSnapping) ||
            // Erzwungenes Snapping nach Animation/Interaktion
            (isComingFromInteractive && targetScene.requiresSnapping) ||
            // Erzwungenes Snapping wenn aktuelle Szene beendet ist
            (currentSceneState?.isComplete && targetScene.requiresSnapping)
          );
          
          console.log('Store: Snapping decision:', {
            shouldEnableSnapping,
            reason: isAvocadoScene
              ? 'Avocado scene - snapping disabled'
              : isComingFromAvocado
                ? 'Coming from avocado scene'
                : isComingFromInteractive
                  ? 'Coming from interactive scene'
                  : currentSceneState?.isComplete
                    ? 'Current scene completed'
                    : shouldEnableSnapping 
                      ? 'Scene allows snapping'
                      : 'Snapping disabled by configuration',
            sceneType: targetScene.config.type,
            fromType: currentSceneState?.config?.type,
            isComplete: currentSceneState?.isComplete
          });
          
          // Setze Snapping-Status
          setSnappingEnabled(!!shouldEnableSnapping);
          
          // Setze Animation-Status und dispatche Event
          const eventDetail = {
            sceneId,
            withLock: shouldEnableSnapping,
            enableSnapping: shouldEnableSnapping,
            preserveScrollPosition: targetScene.config.preserveScrollPosition || isAvocadoScene,
            isAnimated: targetScene.isAnimated,
            previousScene,
            timestamp: Date.now()
          };

          useBaseStore.getState().setIsAnimationScene(targetScene.isAnimated);
          
          // Nur scrollen, wenn wir nicht bereits scrollen oder wenn es ein erzwungener Übergang ist
          if (!currentState.isScrolling || shouldEnableSnapping || currentSceneState?.isComplete) {
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
          const currentSceneState = previousScene ? currentState.sceneStates[previousScene] : null;
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
          
          // Snapping-Status aktualisieren mit der gleichen Logik wie in scrollToScene
          const isAvocadoScene = sceneId === 'avocado-scene';
          const isComingFromAvocado = previousScene === 'avocado-scene';
          
          const shouldEnableSnapping = !isAvocadoScene && (
            // Normale Snapping-Regeln
            (targetScene.config.allowSnapping && targetScene.requiresSnapping) ||
            // Erzwungenes Snapping nach Avocado-Szene
            (isComingFromAvocado && currentState.sceneStates[sceneId]?.requiresSnapping) ||
            // Erzwungenes Snapping nach Animation/Interaktion
            (currentSceneState?.config.type === 'interactive' && targetScene.requiresSnapping)
          );
          
          setSnappingEnabled(shouldEnableSnapping);

          console.log('Store: Scene state updated:', {
            scene: sceneId,
            from: previousScene || 'initial',
            isAnimated: targetScene.isAnimated,
            requiresSnapping: targetScene.requiresSnapping,
            isAvocadoScene,
            isComingFromAvocado,
            snappingEnabled: shouldEnableSnapping,
            sceneType: targetScene.config.type,
            fromType: currentSceneState?.config.type
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

          // Erweiterte Logik für automatisches Scrollen
          const isInteractiveScene = sceneState.config.type === 'interactive';
          const isAvocadoScene = sceneId === 'avocado-scene';
          const shouldAutoScroll = (
            !isAvocadoScene && (
              // Normale Szenen mit Snapping
              (!sceneState.isAnimated && sceneState.requiresSnapping) ||
              // Interaktive Szenen nach Abschluss
              (isInteractiveScene && sceneState.requiresSnapping)
            )
          );

          console.log('Store: Scene complete:', {
            scene: sceneId,
            isInteractive: isInteractiveScene,
            shouldAutoScroll,
            isAnimated: sceneState.isAnimated,
            requiresSnapping: sceneState.requiresSnapping
          });

          if (shouldAutoScroll) {
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
          
          const currentState = get();
          
          // Überprüfe alle Szenen-Konfigurationen
          const updatedSceneStates = { ...currentState.sceneStates };
          Object.entries(updatedSceneStates).forEach(([sceneId, state]) => {
            if (!state.config) {
              console.error(`Store: Missing configuration for scene ${sceneId}, setting defaults`);
              state.config = {
                type: 'static',
                allowSnapping: true,
                preserveScrollPosition: false,
                hasScrollTimeline: false
              };
            }
          });
          
          // Setze initiale Szene und aktualisierte Konfigurationen
          set((state) => ({
            isInitialized: true,
            sceneStates: {
              ...updatedSceneStates,
              'welcome-scene': {
                ...updatedSceneStates['welcome-scene']!,
                isReady: true,
                isActive: true
              }
            }
          }));

          // Debug-Log für alle Szenen-Konfigurationen
          console.log('Store: Scene configurations after initialization:', 
            Object.entries(updatedSceneStates).reduce((acc, [sceneId, state]) => ({
              ...acc,
              [sceneId]: {
                config: state.config,
                isAnimated: state.isAnimated,
                requiresSnapping: state.requiresSnapping
              }
            }), {})
          );
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