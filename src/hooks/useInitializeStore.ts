import { useEffect } from 'react';
import { useSceneStore } from '../stores/sceneStore';
import { useBaseStore } from '../stores/baseStore';
import { useScrollStore } from '../stores/scrollStore';

export const useInitializeStore = () => {
  const initialize = useSceneStore((state) => state.initialize);
  const isInitialized = useSceneStore((state) => state.isInitialized);

  useEffect(() => {
    console.log('Store: Initializing stores');
    
    // Reset alle Store-States
    useBaseStore.getState().setIsScrolling(false);
    useBaseStore.getState().setIsAnimationScene(false);
    useScrollStore.getState().setSnappingEnabled(false);
    
    // Initialisiere Scene Store
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return isInitialized;
}; 