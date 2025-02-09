import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
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
  shouldAutoplay: boolean;
  isScrollTriggered: boolean;
  metadata: VideoMetadata;
}

interface GlobalVideoState {
  activeVideoId: VideoId | null;
  videoStates: Record<VideoId, VideoState>;
  isInitialized: boolean;
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

  // Autoplay
  setShouldAutoplay: (videoId: VideoId, shouldAutoplay: boolean) => void;

  // Initialisierung
  initialize: () => void;

  // Neue Aktion für Scroll-Trigger
  setScrollTriggered: (videoId: VideoId, isTriggered: boolean) => void;
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
  shouldAutoplay: false,
  isScrollTriggered: false,
  metadata: initialMetadata
};

const initialState: GlobalVideoState = {
  activeVideoId: null,
  videoStates: {
    'video-scene': { ...initialVideoState }
  },
  isInitialized: false
};

export const useVideoStore = create<GlobalVideoState & VideoActions>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        ...initialState,

        initialize: () => {
          if (get().isInitialized) return;
          
          // Stelle sicher, dass der baseStore zuerst initialisiert wird
          const { initialize: initializeBase } = useBaseStore.getState();
          initializeBase();
          
          // Reset aller Video-States beim Initialisieren
          set((state) => ({
            ...state,
            isInitialized: true,
            activeVideoId: null,
            videoStates: {
              'video-scene': {
                ...initialVideoState,
                isPlaying: false,
                isScrollTriggered: false,
                shouldAutoplay: false,
                isReady: false
              }
            }
          }));
        },

        setScrollTriggered: (videoId, isTriggered) => {
          const currentState = get().videoStates[videoId];
          const { isInitialized } = useBaseStore.getState();
          
          console.log(`VideoStore: setScrollTriggered`, {
            videoId,
            isTriggered,
            currentState,
            isInitialized
          });
          
          // Nicht triggern wenn:
          // 1. Video nicht bereit
          // 2. Store nicht initialisiert
          if (!currentState.isReady || !isInitialized) {
            console.log('VideoStore: Trigger conditions not met');
            return;
          }
          
          set((state) => {
            const newState = {
              videoStates: {
                ...state.videoStates,
                [videoId]: {
                  ...state.videoStates[videoId],
                  isScrollTriggered: isTriggered,
                  isPlaying: isTriggered // Direkt isPlaying setzen
                }
              }
            };
            console.log('VideoStore: New state after scroll trigger:', newState);
            return newState;
          });
        },

        play: (videoId) => {
          const videoState = get().videoStates[videoId];
          const { isInitialized } = useBaseStore.getState();
          
          console.log(`VideoStore: play attempt`, {
            videoId,
            videoState,
            isInitialized
          });
          
          // Nicht abspielen wenn:
          // 1. Video nicht bereit
          // 2. Store nicht initialisiert
          if (!videoState.isReady || !isInitialized) {
            console.log('VideoStore: Play conditions not met');
            return;
          }

          const { markSceneAsActive } = useSceneStore.getState();

          set((state) => {
            const newState = {
              activeVideoId: videoId,
              videoStates: {
                ...state.videoStates,
                [videoId]: {
                  ...state.videoStates[videoId],
                  isPlaying: true,
                  shouldAutoplay: false,
                  isComplete: false
                }
              }
            };
            console.log('VideoStore: New state after play:', newState);
            return newState;
          });

          markSceneAsActive(videoId);
        },

        pause: (videoId) => {
          set((state) => ({
            videoStates: {
              ...state.videoStates,
              [videoId]: {
                ...state.videoStates[videoId],
                isPlaying: false,
                shouldAutoplay: false
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
          
          console.log(`VideoStore: markVideoAsReady`, {
            videoId,
            currentState: get().videoStates[videoId]
          });
          
          set((state) => {
            const newState = {
              videoStates: {
                ...state.videoStates,
                [videoId]: {
                  ...state.videoStates[videoId],
                  isReady: true,
                  isPlaying: false,
                  isScrollTriggered: false
                }
              }
            };
            console.log('VideoStore: New state after ready:', newState);
            return newState;
          });
          
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
                isPlaying: false,
                shouldAutoplay: false,
                isScrollTriggered: false // Reset scroll trigger wenn Video fertig ist
              }
            }
          }));
          
          markSceneAsComplete(videoId);
        },

        resetVideo: (videoId) => {
          const { resetScene } = useSceneStore.getState();
          const currentState = get();
          const shouldAutoplay = currentState.videoStates[videoId].shouldAutoplay;
          
          set((state) => ({
            videoStates: {
              ...state.videoStates,
              [videoId]: {
                ...initialVideoState,
                shouldAutoplay // Behalte den aktuellen shouldAutoplay-Status bei
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
        },

        setShouldAutoplay: (videoId, shouldAutoplay) => {
          set((state) => ({
            videoStates: {
              ...state.videoStates,
              [videoId]: {
                ...state.videoStates[videoId],
                shouldAutoplay
              }
            }
          }));
        }
      })),
      {
        name: 'video-store',
        partialize: (state) => ({
          activeVideoId: state.activeVideoId,
          videoStates: state.videoStates,
          isInitialized: state.isInitialized,
          isScrollTriggered: state.videoStates['video-scene'].isScrollTriggered
        })
      }
    )
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

export const useShouldVideoAutoplay = (videoId: VideoId): boolean =>
  useVideoStore((state) => state.videoStates[videoId].shouldAutoplay);

export const useIsScrollTriggered = (videoId: VideoId): boolean =>
  useVideoStore((state) => state.videoStates[videoId].isScrollTriggered); 