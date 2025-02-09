import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useBaseStore } from './baseStore';
import { useSceneStore } from './sceneStore';
import { useVideoStore } from './videoStore';
import { useScrollStore } from './scrollStore';


interface RootState {
  isInitialized: boolean;
  isHydrated: boolean;
}

interface RootActions {
  initialize: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useRootStore = create<RootState & RootActions>()(
  devtools(
    persist(
      (set, get) => ({
        isInitialized: false,
        isHydrated: false,

        initialize: async () => {
          if (get().isInitialized) return;

          // 1. Hydrate stores first
          await get().hydrate();

          // 2. Initialize base store
          const baseStore = useBaseStore.getState();
          baseStore.setIsScrolling(false);
          baseStore.setIsAnimationScene(false);
          baseStore.initialize();

          // 3. Initialize scroll store
          const scrollStore = useScrollStore.getState();
          scrollStore.initialize();
          scrollStore.setSnappingEnabled(true);

          // 4. Initialize scene store with welcome scene
          const sceneStore = useSceneStore.getState();
          sceneStore.initialize();
          sceneStore.setCurrentScene('welcome-scene');

          // 5. Initialize video store (but don't autoplay)
          const videoStore = useVideoStore.getState();
          videoStore.initialize();

          // 6. Set up store subscriptions
          useSceneStore.subscribe(
            (state) => state.currentScene,
            (currentScene) => {
              if (!currentScene) return;

              // Verwende die Szenenkonfiguration für globale Zustände
              const sceneState = useSceneStore.getState().sceneStates[currentScene];
              if (!sceneState) return;

              // Aktualisiere globale Zustände basierend auf Szenenkonfiguration
              scrollStore.setSnappingEnabled(sceneState.requiresSnapping);
              baseStore.setIsAnimationScene(sceneState.isAnimated);

              // Spezielle Video-Szenen-Initialisierung
              if (currentScene === 'video-scene') {
                videoStore.resetVideo('video-scene');
              }
            }
          );

          set({ isInitialized: true });
        },

        hydrate: async () => {
          if (get().isHydrated) return;

          // Rehydrate all stores in order
          await Promise.all([
            useBaseStore.persist.rehydrate(),
            useScrollStore.persist.rehydrate(),
            useSceneStore.persist.rehydrate(),
            useVideoStore.persist.rehydrate()
          ]);

          set({ isHydrated: true });
        }
      }),
      {
        name: 'root-store',
        partialize: (state) => ({ 
          isInitialized: state.isInitialized,
          isHydrated: state.isHydrated 
        })
      }
    )
  )
); 