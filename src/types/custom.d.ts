declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module 'react-player' {
  import { ComponentType, ForwardRefExoticComponent, RefAttributes } from 'react';

  interface ReactPlayerProps {
    url: string;
    playing?: boolean;
    loop?: boolean;
    controls?: boolean;
    light?: boolean;
    volume?: number;
    muted?: boolean;
    playbackRate?: number;
    width?: string | number;
    height?: string | number;
    style?: object;
    progressInterval?: number;
    playsinline?: boolean;
    pip?: boolean;
    className?: string;
    config?: {
      file?: {
        attributes?: {
          crossOrigin?: string;
        };
      };
    };
    onReady?: () => void;
    onStart?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onBuffer?: () => void;
    onBufferEnd?: () => void;
    onError?: (error: unknown) => void;
    onDuration?: (duration: number) => void;
    onEnded?: () => void;
    onProgress?: (state: {
      played: number;
      playedSeconds: number;
      loaded: number;
      loadedSeconds: number;
    }) => void;
  }

  interface ReactPlayerInstance {
    seekTo: (amount: number, type: 'seconds' | 'fraction') => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getInternalPlayer: (key?: string) => any;
  }

  const ReactPlayer: ForwardRefExoticComponent<ReactPlayerProps & RefAttributes<ReactPlayerInstance>>;
  export default ReactPlayer;
}

declare module 'react-player/lazy' {
  import ReactPlayer from 'react-player';
  export default ReactPlayer;
} 