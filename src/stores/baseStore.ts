import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface BaseState {
  isScrolling: boolean;
  isAnimationScene: boolean;
  isInitialized: boolean;
}

interface BaseActions {
  setIsScrolling: (scrolling: boolean) => void;
  setIsAnimationScene: (isAnimation: boolean) => void;
  initialize: () => void;
}

const initialState: BaseState = {
  isScrolling: false,
  isAnimationScene: false,
  isInitialized: false
};

export const useBaseStore = create<BaseState & BaseActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setIsScrolling: (scrolling) => set({ isScrolling: scrolling }),
        setIsAnimationScene: (isAnimation) => set({ isAnimationScene: isAnimation }),
        initialize: () => {
          if (get().isInitialized) return;
          set({ isInitialized: true });
        }
      }),
      {
        name: 'base-store',
        partialize: (state) => ({
          isAnimationScene: state.isAnimationScene,
          isInitialized: state.isInitialized
        })
      }
    )
  )
); 