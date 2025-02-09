import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useBaseStore } from './baseStore';
import { useSceneStore, SceneId } from './sceneStore';
import { useVideoStore } from './videoStore';
import { useScrollStore } from './scrollStore';

interface RootState {
  isInitialized: boolean;
  isHydrated: boolean;
  initializationStep: 'none' | 'hydrating' | 'initializing' | 'complete';
  lastTransition: {
    from: SceneId;
    to: SceneId;
    timestamp: number;
  } | null;
}

interface RootActions {
  initialize: () => Promise<void>;
  hydrate: () => Promise<void>;
  logTransition: (from: SceneId, to: SceneId) => void;
}

export const useRootStore = create<RootState & RootActions>()(
  devtools(
    persist(
      (set, get) => ({
        isInitialized: false,
        isHydrated: false,
        initializationStep: 'none',
        lastTransition: null,

        logTransition: (from: SceneId, to: SceneId) => {
          const transition = {
            from,
            to,
            timestamp: Date.now()
          };
          console.log('Scene Transition:', transition);
          set({ lastTransition: transition });
        },

        initialize: async () => {
          if (get().isInitialized) return;
          
          set({ initializationStep: 'initializing' });
          console.log('Root Store: Starting initialization');

          try {
            // 1. Ensure hydration is complete
            if (!get().isHydrated) {
              await get().hydrate();
            }

            // 2. Reset all stores to initial state
            console.log('Root Store: Resetting stores');
            const baseStore = useBaseStore.getState();
            const scrollStore = useScrollStore.getState();
            const sceneStore = useSceneStore.getState();
            const videoStore = useVideoStore.getState();

            // 3. Initialize base store first
            console.log('Root Store: Initializing base store');
            baseStore.setIsScrolling(false);
            baseStore.setIsAnimationScene(false);
            baseStore.initialize();

            // 4. Initialize scroll store
            console.log('Root Store: Initializing scroll store');
            scrollStore.initialize();
            scrollStore.setSnappingEnabled(true);

            // 5. Initialize scene store
            console.log('Root Store: Initializing scene store');
            sceneStore.initialize();

            // 6. Initialize video store (explicitly prevent autoplay)
            console.log('Root Store: Initializing video store');
            videoStore.initialize();
            videoStore.pause('video-scene');

            // 7. Set up store subscriptions
            console.log('Root Store: Setting up subscriptions');
            useSceneStore.subscribe(
              (state) => state.currentScene,
              (currentScene, previousScene) => {
                if (!currentScene) return;

                // Log transition
                get().logTransition(previousScene, currentScene);

                const sceneState = useSceneStore.getState().sceneStates[currentScene];
                if (!sceneState) return;

                // Spezielle Behandlung für Avocado-Szene
                const isAvocadoScene = currentScene === 'avocado-scene';
                const isComingFromAvocado = previousScene === 'avocado-scene';

                // Update global states based on scene configuration
                scrollStore.setSnappingEnabled(!isAvocadoScene && sceneState.requiresSnapping);
                baseStore.setIsAnimationScene(sceneState.isAnimated);

                // Special handling for video scene
                if (currentScene === 'video-scene') {
                  videoStore.resetVideo('video-scene');
                  // Ensure video doesn't autoplay on first load
                  if (!get().isInitialized) {
                    videoStore.pause('video-scene');
                  }
                }

                // Log scene configuration
                console.log('Scene Configuration:', {
                  scene: currentScene,
                  from: previousScene || 'initial',
                  isAnimated: sceneState.isAnimated,
                  requiresSnapping: sceneState.requiresSnapping,
                  isAvocadoScene,
                  isComingFromAvocado,
                  snappingEnabled: !isAvocadoScene && sceneState.requiresSnapping
                });
              }
            );

            // 8. Set initial scene
            console.log('Root Store: Setting initial scene');
            sceneStore.setCurrentScene('welcome-scene');

            // 9. Mark initialization as complete
            console.log('Root Store: Initialization complete');
            set({ 
              isInitialized: true,
              initializationStep: 'complete'
            });

          } catch (error) {
            console.error('Root Store: Initialization failed', error);
            set({ initializationStep: 'none' });
            throw error;
          }
        },

        hydrate: async () => {
          if (get().isHydrated) return;
          
          set({ initializationStep: 'hydrating' });
          console.log('Root Store: Starting hydration');

          try {
            // Rehydrate all stores in order
            await Promise.all([
              useBaseStore.persist.rehydrate(),
              useScrollStore.persist.rehydrate(),
              useSceneStore.persist.rehydrate(),
              useVideoStore.persist.rehydrate()
            ]);

            console.log('Root Store: Hydration complete');
            set({ 
              isHydrated: true,
              initializationStep: 'initializing'
            });
          } catch (error) {
            console.error('Root Store: Hydration failed', error);
            set({ initializationStep: 'none' });
            throw error;
          }
        }
      }),
      {
        name: 'root-store',
        partialize: (state) => ({ 
          isInitialized: state.isInitialized,
          isHydrated: state.isHydrated,
          initializationStep: state.initializationStep,
          lastTransition: state.lastTransition
        })
      }
    )
  )
); 