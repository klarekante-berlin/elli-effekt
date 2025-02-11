import { renderHook, act } from '@testing-library/react-hooks';
import { useVideoControl } from '../useVideoControl';

describe('useVideoControl', () => {
  const mockVideoRef = { current: { play: jest.fn(), pause: jest.fn() } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useVideoControl({
      videoRef: mockVideoRef,
      isReadyToPlay: false,
      onComplete: jest.fn()
    }));

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isLoaded).toBe(false);
  });

  it('should handle video load', () => {
    const { result } = renderHook(() => useVideoControl({
      videoRef: mockVideoRef,
      isReadyToPlay: true,
      onComplete: jest.fn()
    }));

    act(() => {
      result.current.handleLoadedData();
    });

    expect(result.current.isLoaded).toBe(true);
  });

  it('should auto-play when ready and loaded', () => {
    const { result } = renderHook(() => useVideoControl({
      videoRef: mockVideoRef,
      isReadyToPlay: true,
      onComplete: jest.fn()
    }));

    act(() => {
      result.current.handleLoadedData();
    });

    expect(mockVideoRef.current.play).toHaveBeenCalled();
  });

  it('should call onComplete when video ends', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useVideoControl({
      videoRef: mockVideoRef,
      isReadyToPlay: true,
      onComplete
    }));

    act(() => {
      result.current.handleEnded();
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('should pause video when not ready to play', () => {
    const { rerender } = renderHook(
      ({ isReadyToPlay }) => useVideoControl({
        videoRef: mockVideoRef,
        isReadyToPlay,
        onComplete: jest.fn()
      }),
      { initialProps: { isReadyToPlay: true } }
    );

    rerender({ isReadyToPlay: false });
    expect(mockVideoRef.current.pause).toHaveBeenCalled();
  });
}); 