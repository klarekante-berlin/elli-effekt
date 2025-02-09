import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { useSceneStore } from './sceneStore';
import { useBaseStore } from './baseStore';

// Typen für Video-IDs
export type VideoId = 'video-scene';

interface VideoMetadata {
  duration: number;
  currentTime: number;
  playbackRate: number;
  volume: number;
}

interface VideoState {
  isReady: boolean;
  isComplete: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  metadata: VideoMetadata;
}

interface GlobalVideoState {
  activeVideoId: VideoId | null;
  videoStates: Record<VideoId, VideoState>;
}

interface VideoActions {
  // Video-Steuerung
  play: (videoId: VideoId) => void;
  pause: (videoId: VideoId) => void;
  togglePlay: (videoId: VideoId) => void;
  
  // Video-Status
  markVideoAsReady: (videoId: VideoId) => void;
  markVideoAsComplete: (videoId: VideoId) => void;
  resetVideo: (videoId: VideoId) => void;
  
  // Metadaten
  updateMetadata: (videoId: VideoId, metadata: Partial<VideoMetadata>) => void;
  
  // Audio
  setMuted: (videoId: VideoId, muted: boolean) => void;
  toggleMuted: (videoId: VideoId) => void;
}

const initialMetadata: VideoMetadata = {
  duration: 0,
  currentTime: 0,
  playbackRate: 1,
  volume: 1
};

const initialVideoState: VideoState = {
  isReady: false,
  isComplete: false,
  isPlaying: false,
  isMuted: false,
  metadata: initialMetadata
};

const initialState: GlobalVideoState = {
  activeVideoId: null,
  videoStates: {
    'video-scene': { ...initialVideoState }
  }
};

export const useVideoStore = create<GlobalVideoState & VideoActions>()(
  subscribeWithSelector(
    devtools((set, get) => ({
      ...initialState,

      play: (videoId) => {
        const { markSceneAsActive } = useSceneStore.getState();

        set((state) => ({
          activeVideoId: videoId,
          videoStates: {
            ...state.videoStates,
            [videoId]: {
              ...state.videoStates[videoId],
              isPlaying: true
            }
          }
        }));

        markSceneAsActive(videoId);
      },

      pause: (videoId) => {
        set((state) => ({
          videoStates: {
            ...state.videoStates,
            [videoId]: {
              ...state.videoStates[videoId],
              isPlaying: false
            }
          }
        }));
      },

      togglePlay: (videoId) => {
        const state = get();
        const videoState = state.videoStates[videoId];
        
        if (videoState?.isPlaying) {
          get().pause(videoId);
        } else {
          get().play(videoId);
        }
      },

      markVideoAsReady: (videoId) => {
        const { markSceneAsReady } = useSceneStore.getState();
        
        set((state) => ({
          videoStates: {
            ...state.videoStates,
            [videoId]: {
              ...state.videoStates[videoId],
              isReady: true
            }
          }
        }));
        
        markSceneAsReady(videoId);
      },

      markVideoAsComplete: (videoId) => {
        const { markSceneAsComplete } = useSceneStore.getState();
        
        set((state) => ({
          videoStates: {
            ...state.videoStates,
            [videoId]: {
              ...state.videoStates[videoId],
              isComplete: true,
              isPlaying: false
            }
          }
        }));
        
        markSceneAsComplete(videoId);
      },

      resetVideo: (videoId) => {
        const { resetScene } = useSceneStore.getState();
        
        set((state) => ({
          videoStates: {
            ...state.videoStates,
            [videoId]: {
              ...initialVideoState
            }
          }
        }));
        
        resetScene(videoId);
      },

      updateMetadata: (videoId, metadata) => {
        set((state) => ({
          videoStates: {
            ...state.videoStates,
            [videoId]: {
              ...state.videoStates[videoId],
              metadata: {
                ...state.videoStates[videoId].metadata,
                ...metadata
              }
            }
          }
        }));
      },

      setMuted: (videoId, muted) => {
        set((state) => ({
          videoStates: {
            ...state.videoStates,
            [videoId]: {
              ...state.videoStates[videoId],
              isMuted: muted
            }
          }
        }));
      },

      toggleMuted: (videoId) => {
        set((state) => ({
          videoStates: {
            ...state.videoStates,
            [videoId]: {
              ...state.videoStates[videoId],
              isMuted: !state.videoStates[videoId].isMuted
            }
          }
        }));
      }
    }))
  )
);

// Selektoren
export const useVideoState = (videoId: VideoId): VideoState => 
  useVideoStore((state) => state.videoStates[videoId]);

export const useIsVideoPlaying = (videoId: VideoId): boolean =>
  useVideoStore((state) => state.videoStates[videoId].isPlaying);

export const useIsVideoReady = (videoId: VideoId): boolean =>
  useVideoStore((state) => state.videoStates[videoId].isReady);

export const useIsVideoComplete = (videoId: VideoId): boolean =>
  useVideoStore((state) => state.videoStates[videoId].isComplete);

export const useVideoMetadata = (videoId: VideoId): VideoMetadata =>
  useVideoStore((state) => state.videoStates[videoId].metadata);

export const useIsVideoMuted = (videoId: VideoId): boolean =>
  useVideoStore((state) => state.videoStates[videoId].isMuted); 