import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useBaseStore } from './baseStore';
import { useSceneStore, SceneId } from './sceneStore';

interface ScrollState {
  isScrolling: boolean;
  currentScrollPosition: number;
  targetScrollPosition: number | null;
  isSnappingEnabled: boolean;
  scrollDirection: 'up' | 'down' | null;
  lastScrollTime: number;
  scrollThreshold: number;
  isMobile: boolean;
}

interface ScrollActions {
  setIsScrolling: (isScrolling: boolean) => void;
  setScrollPosition: (position: number) => void;
  setTargetPosition: (position: number | null) => void;
  setSnappingEnabled: (enabled: boolean) => void;
  setScrollDirection: (direction: 'up' | 'down' | null) => void;
  updateScrollState: (position: number, velocity: number) => void;
  handleSceneTransition: (fromScene: Exclude<SceneId, null>, toScene: Exclude<SceneId, null>) => void;
  setScrollThreshold: (threshold: number) => void;
  initialize: () => void;
}

const initialState: ScrollState = {
  isScrolling: false,
  currentScrollPosition: 0,
  targetScrollPosition: null,
  isSnappingEnabled: true,
  scrollDirection: null,
  lastScrollTime: 0,
  scrollThreshold: 100, // Pixel-Schwellenwert für Scroll-Aktionen
  isMobile: false
};

export const useScrollStore = create<ScrollState & ScrollActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setIsScrolling: (isScrolling) => {
          set({ isScrolling });
          useBaseStore.getState().setIsScrolling(isScrolling);
        },

        setScrollPosition: (position) => {
          set({ currentScrollPosition: position });
        },

        setTargetPosition: (position) => {
          set({ targetScrollPosition: position });
        },

        setSnappingEnabled: (enabled) => {
          set({ isSnappingEnabled: enabled });
        },

        setScrollDirection: (direction) => {
          set({ scrollDirection: direction });
        },

        setScrollThreshold: (threshold) => {
          set({ scrollThreshold: threshold });
        },

        updateScrollState: (position: number, velocity: number) => {
          const { 
            currentScrollPosition, 
            lastScrollTime, 
            isSnappingEnabled,
            scrollThreshold
          } = get();
          
          const now = Date.now();
          const timeDiff = now - lastScrollTime;
          
          // Aktualisiere Scroll-Position
          set({ currentScrollPosition: position });

          // Aktualisiere Scroll-Richtung nur wenn genügend Zeit vergangen ist (Debounce)
          if (timeDiff > 50) {
            const direction = position > currentScrollPosition ? 'down' : 'up';
            set({
              scrollDirection: direction,
              lastScrollTime: now
            });

            // Prüfe auf Scroll-Trigger nur wenn Snapping aktiviert ist
            if (isSnappingEnabled && Math.abs(velocity) > 0.5) {
              const sceneStore = useSceneStore.getState();
              const currentScene = sceneStore.currentScene;
              
              if (currentScene) {
                const currentIndex = sceneStore.sceneOrder.indexOf(currentScene);
                const scrollDiff = Math.abs(position - currentScrollPosition);

                if (scrollDiff > scrollThreshold) {
                  if (direction === 'down' && currentIndex < sceneStore.sceneOrder.length - 1) {
                    const nextScene = sceneStore.sceneOrder[currentIndex + 1];
                    if (nextScene) sceneStore.scrollToScene(nextScene);
                  } else if (direction === 'up' && currentIndex > 0) {
                    const prevScene = sceneStore.sceneOrder[currentIndex - 1];
                    if (prevScene) sceneStore.scrollToScene(prevScene);
                  }
                }
              }
            }
          }
        },

        handleSceneTransition: (fromScene, toScene) => {
          // Setze Scroll-Status für die neue Szene
          const sceneStore = useSceneStore.getState();
          const targetScene = sceneStore.sceneStates[toScene];
          
          if (targetScene) {
            set({ 
              isSnappingEnabled: targetScene.requiresSnapping,
              isScrolling: false,
              targetScrollPosition: null,
              scrollDirection: null
            });
          }
        },

        initialize: () => {
          // Erkennung von mobilen Geräten
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          set({ 
            isMobile,
            // Erhöhe Scroll-Schwellenwert auf mobilen Geräten
            scrollThreshold: isMobile ? 150 : 100,
            currentScrollPosition: window.scrollY,
            lastScrollTime: Date.now()
          });
        }
      }),
      {
        name: 'scroll-store',
        partialize: (state) => ({
          isSnappingEnabled: state.isSnappingEnabled,
          scrollThreshold: state.scrollThreshold,
          isMobile: state.isMobile
        })
      }
    )
  )
); 