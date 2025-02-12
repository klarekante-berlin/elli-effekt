import { renderHook, act } from '@testing-library/react';
import { useSceneControl } from '../useSceneControl';
import gsap from 'gsap';

// Mock GSAP
jest.mock('gsap', () => ({
  registerPlugin: jest.fn(),
  timeline: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    restart: jest.fn(),
    kill: jest.fn()
  })),
  to: jest.fn()
}));

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: jest.fn(() => ({
      kill: jest.fn()
    })),
    getAll: jest.fn(() => [])
  }
}));

describe('useSceneControl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSceneControl({
      id: 'test-scene'
    }));

    expect(result.current.containerRef.current).toBe(null);
    expect(result.current.controller).toBeDefined();
    expect(result.current.isPlaying).toBe(false);
  });

  it('should handle play and pause', () => {
    const { result } = renderHook(() => useSceneControl({
      id: 'test-scene',
      autoStart: false
    }));

    act(() => {
      result.current.controller?.play();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.controller?.pause();
    });
    expect(result.current.isPlaying).toBe(false);
  });

  it('should auto-start when autoStart is true', () => {
    const { result } = renderHook(() => useSceneControl({
      id: 'test-scene',
      autoStart: true
    }));

    expect(result.current.isPlaying).toBe(true);
  });

  it('should call setupScene with controller', () => {
    const setupScene = jest.fn();
    renderHook(() => useSceneControl({
      id: 'test-scene',
      setupScene
    }));

    expect(setupScene).toHaveBeenCalledWith(expect.objectContaining({
      play: expect.any(Function),
      pause: expect.any(Function),
      reset: expect.any(Function),
      cleanup: expect.any(Function)
    }));
  });

  it('should cleanup on unmount', () => {
    const cleanupScene = jest.fn();
    const { unmount } = renderHook(() => useSceneControl({
      id: 'test-scene',
      cleanupScene
    }));

    unmount();
    expect(cleanupScene).toHaveBeenCalled();
  });
}); 