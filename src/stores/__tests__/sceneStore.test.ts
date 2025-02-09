import { act, renderHook } from '@testing-library/react';
import { useSceneStore, SceneId } from '../sceneStore';
import { useBaseStore } from '../baseStore';
import { useScrollStore } from '../scrollStore';

// Mock der GSAP-Funktionen und Events
const mockDispatchEvent = jest.fn();
window.dispatchEvent = mockDispatchEvent;

describe('Scene Store - Snapping Behavior', () => {
  beforeEach(() => {
    // Reset stores
    act(() => {
      useSceneStore.setState({
        currentScene: null,
        previousScene: null,
        isScrolling: false,
        isInitialized: false
      });
      useBaseStore.getState().setIsScrolling(false);
      useScrollStore.getState().setSnappingEnabled(false);
    });
    mockDispatchEvent.mockClear();
  });

  describe('scrollToScene', () => {
    it('should enable snapping when target scene requires it', () => {
      const { result } = renderHook(() => useSceneStore());
      
      act(() => {
        result.current.scrollToScene('audio-scene');
      });

      expect(useScrollStore.getState().isSnappingEnabled).toBe(true);
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            sceneId: 'audio-scene',
            enableSnapping: true
          })
        })
      );
    });

    it('should enable snapping when coming from avocado scene', () => {
      const { result } = renderHook(() => useSceneStore());
      
      // Erst zur Avocado-Szene
      act(() => {
        result.current.setCurrentScene('avocado-scene');
      });

      // Dann zurück zur Video-Szene
      act(() => {
        result.current.scrollToScene('video-scene');
      });

      expect(useScrollStore.getState().isSnappingEnabled).toBe(true);
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            sceneId: 'video-scene',
            enableSnapping: true
          })
        })
      );
    });

    it('should disable snapping for avocado scene', () => {
      const { result } = renderHook(() => useSceneStore());
      
      act(() => {
        result.current.scrollToScene('avocado-scene');
      });

      expect(useScrollStore.getState().isSnappingEnabled).toBe(false);
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            sceneId: 'avocado-scene',
            enableSnapping: false
          })
        })
      );
    });
  });

  describe('scrollToNextScene', () => {
    it('should scroll to next scene when current scene requires snapping', () => {
      const { result } = renderHook(() => useSceneStore());
      
      // Start mit Audio-Szene (requiresSnapping: true)
      act(() => {
        result.current.setCurrentScene('audio-scene');
        result.current.scrollToNextScene();
      });

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            sceneId: 'video-scene'
          })
        })
      );
    });

    it('should not automatically scroll to avocado scene', () => {
      const { result } = renderHook(() => useSceneStore());
      
      // Start mit Chat-Szene
      act(() => {
        result.current.setCurrentScene('chat-scene');
        result.current.scrollToNextScene();
      });

      // Sollte nicht automatisch zur Avocado-Szene scrollen
      expect(mockDispatchEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            sceneId: 'avocado-scene'
          })
        })
      );
    });
  });

  describe('Scene State Changes', () => {
    it('should properly update scene states when changing scenes', () => {
      const { result } = renderHook(() => useSceneStore());
      
      act(() => {
        result.current.setCurrentScene('audio-scene');
      });

      expect(result.current.sceneStates['audio-scene'].isActive).toBe(true);
      expect(useScrollStore.getState().isSnappingEnabled).toBe(true);

      act(() => {
        result.current.setCurrentScene('avocado-scene');
      });

      expect(result.current.sceneStates['audio-scene'].isActive).toBe(false);
      expect(result.current.sceneStates['avocado-scene'].isActive).toBe(true);
      expect(useScrollStore.getState().isSnappingEnabled).toBe(false);
    });

    it('should maintain correct previous scene reference', () => {
      const { result } = renderHook(() => useSceneStore());
      
      act(() => {
        result.current.setCurrentScene('audio-scene');
        result.current.setCurrentScene('video-scene');
      });

      expect(result.current.previousScene).toBe('audio-scene');
      expect(result.current.currentScene).toBe('video-scene');
    });
  });
}); 