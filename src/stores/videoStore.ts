import { create } from 'zustand';
import { StateCreator } from 'zustand';

interface VideoState {
  activeVideoId: string | null;
  playingVideos: Set<string>;
  readyToPlayFromAudio: boolean;
  userPausedVideos: Set<string>;
  
  // Actions
  setActiveVideo: (id: string | null) => void;
  playVideo: (id: string) => void;
  pauseVideo: (id: string) => void;
  setReadyToPlayFromAudio: (ready: boolean) => void;
  setUserPaused: (id: string, paused: boolean) => void;
  isVideoPlaying: (id: string) => boolean;
  isUserPaused: (id: string) => boolean;
}

export const useVideoStore = create<VideoState>((set: any, get: any) => ({
  activeVideoId: null,
  playingVideos: new Set<string>(),
  readyToPlayFromAudio: false,
  userPausedVideos: new Set<string>(),

  setActiveVideo: (id: string | null) => set({ activeVideoId: id }),
  
  playVideo: (id: string) => set((state: VideoState) => {
    const newPlayingVideos = new Set(state.playingVideos);
    newPlayingVideos.add(id);
    return { playingVideos: newPlayingVideos };
  }),
  
  pauseVideo: (id: string) => set((state: VideoState) => {
    const newPlayingVideos = new Set(state.playingVideos);
    newPlayingVideos.delete(id);
    return { playingVideos: newPlayingVideos };
  }),
  
  setReadyToPlayFromAudio: (ready: boolean) => set({ readyToPlayFromAudio: ready }),
  
  setUserPaused: (id: string, paused: boolean) => set((state: VideoState) => {
    const newUserPausedVideos = new Set(state.userPausedVideos);
    if (paused) {
      newUserPausedVideos.add(id);
    } else {
      newUserPausedVideos.delete(id);
    }
    return { userPausedVideos: newUserPausedVideos };
  }),
  
  isVideoPlaying: (id: string) => get().playingVideos.has(id),
  
  isUserPaused: (id: string) => get().userPausedVideos.has(id),
})); 