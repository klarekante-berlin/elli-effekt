import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface BaseState {
  isScrolling: boolean;
  isAnimationScene: boolean;
}

interface BaseActions {
  setIsScrolling: (scrolling: boolean) => void;
  setIsAnimationScene: (isAnimation: boolean) => void;
}

export const useBaseStore = create<BaseState & BaseActions>()(
  devtools(
    persist(
      (set) => ({
        isScrolling: false,
        isAnimationScene: false,
        setIsScrolling: (scrolling) => set({ isScrolling: scrolling }),
        setIsAnimationScene: (isAnimation) => set({ isAnimationScene: isAnimation }),
      }),
      {
        name: 'base-store',
        partialize: (state) => ({ isAnimationScene: state.isAnimationScene }),
      }
    )
  )
); 