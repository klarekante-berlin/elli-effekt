declare module 'lenis/react' {
  export interface LenisInstance {
    scrollTo: (target: string | HTMLElement, options?: ScrollToOptions) => void;
    on: (event: string, callback: Function) => void;
    off: (event: string, callback: Function) => void;
    raf?: (time: number) => void;
    lenis?: any;
  }

  export interface ScrollToOptions {
    offset?: number;
    duration?: number;
    easing?: (t: number) => number;
    immediate?: boolean;
    lock?: boolean;
    force?: boolean;
  }

  export interface ReactLenisProps {
    root?: boolean;
    options?: {
      duration?: number;
      easing?: (t: number) => number;
      smoothWheel?: boolean;
      wheelMultiplier?: number;
      touchMultiplier?: number;
      infinite?: boolean;
      orientation?: 'vertical' | 'horizontal';
    };
    children?: React.ReactNode;
  }

  export const ReactLenis: React.FC<ReactLenisProps>;
  export function useLenis(callback?: (props: { scroll: number; velocity: number }) => void): LenisInstance;
} 