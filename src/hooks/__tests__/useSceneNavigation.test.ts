import { renderHook, act } from '@testing-library/react-hooks';
import { useSceneNavigation } from '../useSceneNavigation';

describe('useSceneNavigation', () => {
  it('should initialize with welcome scene', () => {
    const { result } = renderHook(() => useSceneNavigation());
    expect(result.current.currentScene).toBe('welcome');
  });

  it('should navigate to a new scene', () => {
    const { result } = renderHook(() => useSceneNavigation());
    
    act(() => {
      result.current.navigateToScene('audio-scene');
    });

    expect(result.current.currentScene).toBe('audio-scene');
    expect(result.current.isTransitioning).toBe(true);
  });
}); 