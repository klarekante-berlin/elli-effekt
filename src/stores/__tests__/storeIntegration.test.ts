import { act, renderHook } from '@testing-library/react';
import { useRootStore } from '../rootStore';
import { useSceneStore } from '../sceneStore';
import { useVideoStore } from '../videoStore';
import { useBaseStore } from '../baseStore';
import { useScrollStore } from '../scrollStore';

describe('Store Integration Tests', () => {
  beforeEach(() => {
    // Reset all stores before each test
    act(() => {
      useRootStore.setState({ isInitialized: false, isHydrated: false });
      useSceneStore.setState({ currentScene: null, isInitialized: false });
      useVideoStore.setState({ activeVideoId: null, isInitialized: false });
      useBaseStore.setState({ isScrolling: false, isAnimationScene: false, isInitialized: false });
      useScrollStore.setState({ isScrolling: false, isSnappingEnabled: true });
    });
  });

  describe('Initialization', () => {
    it('should initialize stores in correct order', async () => {
      const { result: rootResult } = renderHook(() => useRootStore());
      const { result: sceneResult } = renderHook(() => useSceneStore());
      const { result: videoResult } = renderHook(() => useVideoStore());

      await act(async () => {
        await rootResult.current.initialize();
      });

      expect(rootResult.current.isInitialized).toBe(true);
      expect(sceneResult.current.currentScene).toBe('welcome-scene');
      expect(videoResult.current.activeVideoId).toBe(null);
    });
  });

  describe('Scene Transitions', () => {
    it('should handle video scene correctly', async () => {
      const { result: sceneResult } = renderHook(() => useSceneStore());
      const { result: videoResult } = renderHook(() => useVideoStore());

      // Initialize
      await act(async () => {
        await useRootStore.getState().initialize();
      });

      // Transition to video scene
      act(() => {
        sceneResult.current.setCurrentScene('video-scene');
      });

      expect(sceneResult.current.currentScene).toBe('video-scene');
      expect(videoResult.current.videoStates['video-scene'].isPlaying).toBe(false);

      // Mark video as ready
      act(() => {
        videoResult.current.markVideoAsReady('video-scene');
      });

      expect(videoResult.current.videoStates['video-scene'].isReady).toBe(true);
      expect(sceneResult.current.sceneStates['video-scene']?.isReady).toBe(true);
    });

    it('should handle avocado scene correctly', async () => {
      const { result: sceneResult } = renderHook(() => useSceneStore());
      const { result: scrollResult } = renderHook(() => useScrollStore());

      // Initialize
      await act(async () => {
        await useRootStore.getState().initialize();
      });

      // Transition to avocado scene
      act(() => {
        sceneResult.current.setCurrentScene('avocado-scene');
      });

      expect(sceneResult.current.currentScene).toBe('avocado-scene');
      expect(scrollResult.current.isSnappingEnabled).toBe(false);
      expect(useBaseStore.getState().isAnimationScene).toBe(true);
    });
  });

  describe('Scene Completion', () => {
    it('should auto-advance non-animated scenes', async () => {
      const { result: sceneResult } = renderHook(() => useSceneStore());

      // Initialize
      await act(async () => {
        await useRootStore.getState().initialize();
      });

      // Complete welcome scene
      act(() => {
        sceneResult.current.markSceneAsComplete('welcome-scene');
      });

      expect(sceneResult.current.currentScene).toBe('audio-scene');
    });

    it('should not auto-advance animated scenes', async () => {
      const { result: sceneResult } = renderHook(() => useSceneStore());

      // Initialize
      await act(async () => {
        await useRootStore.getState().initialize();
      });

      // Set and complete avocado scene
      act(() => {
        sceneResult.current.setCurrentScene('avocado-scene');
        sceneResult.current.markSceneAsComplete('avocado-scene');
      });

      expect(sceneResult.current.currentScene).toBe('avocado-scene');
    });
  });
}); 