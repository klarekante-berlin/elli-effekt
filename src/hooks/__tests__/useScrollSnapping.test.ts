import { renderHook, act } from '@testing-library/react-hooks';
import { useScrollSnapping } from '../useScrollSnapping';

const mockLenisInstance = {
  on: jest.fn(),
  off: jest.fn(),
  scrollTo: jest.fn()
};

describe('useScrollSnapping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.querySelectorAll = jest.fn().mockReturnValue([
      {
        getBoundingClientRect: () => ({
          top: 100,
          bottom: 200
        })
      }
    ]);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useScrollSnapping(mockLenisInstance));
    
    expect(result.current.isScrolling).toBe(false);
    expect(result.current.isAnimationScene).toBe(false);
  });

  it('should handle scroll events', () => {
    const { result } = renderHook(() => useScrollSnapping(mockLenisInstance));
    
    expect(mockLenisInstance.on).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('should cleanup scroll listeners', () => {
    const { unmount } = renderHook(() => useScrollSnapping(mockLenisInstance));
    
    unmount();
    expect(mockLenisInstance.off).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('should not snap when scrolling is in progress', () => {
    const { result } = renderHook(() => useScrollSnapping(mockLenisInstance));
    
    act(() => {
      result.current.setIsScrolling(true);
    });

    const scrollCallback = mockLenisInstance.on.mock.calls[0][1];
    scrollCallback({ scroll: 100, velocity: 0 });

    expect(mockLenisInstance.scrollTo).not.toHaveBeenCalled();
  });
}); 