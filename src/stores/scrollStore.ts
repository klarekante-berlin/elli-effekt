import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ScrollState {
  isSnappingEnabled: boolean;
  isInitialized: boolean;
}

interface ScrollActions {
  setSnappingEnabled: (enabled: boolean) => void;
  initialize: () => void;
}

const initialState: ScrollState = {
  isSnappingEnabled: true,
  isInitialized: false
};

export const useScrollStore = create<ScrollState & ScrollActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setSnappingEnabled: (enabled) => {
          set({ isSnappingEnabled: enabled });
          // Dispatch ein Event für Lenis oder andere Scroll-Handler
          window.dispatchEvent(new CustomEvent('snappingStateChanged', { 
            detail: { enabled } 
          }));
        },

        initialize: () => {
          if (get().isInitialized) return;
          set({ isInitialized: true });
        }
      }),
      {
        name: 'scroll-store',
        partialize: (state) => ({
          isSnappingEnabled: state.isSnappingEnabled,
          isInitialized: state.isInitialized
        })
      }
    )
  )
);

// Selektoren
export const useIsSnappingEnabled = (): boolean =>
  useScrollStore((state) => state.isSnappingEnabled); 