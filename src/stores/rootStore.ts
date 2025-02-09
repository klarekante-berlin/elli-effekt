import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useBaseStore } from './baseStore';
import { useSceneStore } from './sceneStore';
import { useVideoStore } from './videoStore';

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

          // Initialisiere Stores in der richtigen Reihenfolge
          const { setIsScrolling, setIsAnimationScene } = useBaseStore.getState();
          const { setCurrentScene } = useSceneStore.getState();

          // Base Store Reset
          setIsScrolling(false);
          setIsAnimationScene(false);

          // Scene Store Initialisierung
          setCurrentScene('welcome-scene');

          set({ isInitialized: true });
        },

        hydrate: async () => {
          if (get().isHydrated) return;

          // Stelle sicher, dass persistierte Zustände korrekt geladen sind
          await Promise.all([
            useBaseStore.persist.rehydrate(),
            useSceneStore.persist.rehydrate(),
            useVideoStore.persist.rehydrate()
          ]);

          set({ isHydrated: true });
        }
      }),
      {
        name: 'root-store',
        partialize: (state) => ({ isInitialized: state.isInitialized })
      }
    )
  )
); 