import { create } from 'zustand';
import { StateCreator } from 'zustand';

interface VideoState {
  activeVideoId: string | null;
  playingVideos: Set<string>;
  readyToPlayFromAudio: boolean;
  userPausedVideos: Set<string>;
  initializedVideos: Set<string>;
  
  // Actions
  setActiveVideo: (id: string | null) => void;
  playVideo: (id: string) => void;
  pauseVideo: (id: string) => void;
  setReadyToPlayFromAudio: (ready: boolean) => void;
  setUserPaused: (id: string, paused: boolean) => void;
  initializeVideo: (id: string) => void;
  isVideoPlaying: (id: string) => boolean;
  isUserPaused: (id: string) => boolean;
  isVideoInitialized: (id: string) => boolean;
  resetState: () => void;
}

const initialState = {
  activeVideoId: null,
  playingVideos: new Set<string>(),
  readyToPlayFromAudio: false,
  userPausedVideos: new Set<string>(),
  initializedVideos: new Set<string>(),
};

export const useVideoStore = create<VideoState>((set, get) => ({
  ...initialState,

  setActiveVideo: (id: string | null) => set({ activeVideoId: id }),
  
  playVideo: (id: string) => set((state: VideoState) => {
    if (!id) {
      console.log('Video kann nicht abgespielt werden: keine ID');
      return state;
    }

    // Wenn das Video bereits abgespielt wird, nichts tun
    if (state.playingVideos.has(id)) {
      console.log(`Video ${id}: Wird bereits abgespielt`);
      return state;
    }

    // Wenn das Video manuell pausiert wurde, nicht automatisch starten
    if (state.userPausedVideos.has(id)) {
      console.log(`Video ${id}: Ist manuell pausiert`);
      return state;
    }

    // Video abspielen und alle anderen pausieren
    console.log(`Video ${id}: Play`);
    const newPlayingVideos = new Set([id]); // Nur das aktuelle Video abspielen
    return { 
      playingVideos: newPlayingVideos,
      activeVideoId: id 
    };
  }),
  
  pauseVideo: (id: string) => set((state: VideoState) => {
    if (!id) return state;

    console.log(`Video ${id}: Pause`);
    const newPlayingVideos = new Set(state.playingVideos);
    newPlayingVideos.delete(id);
    
    // Wenn das aktive Video pausiert wird, activeVideoId zurücksetzen
    const newActiveVideoId = state.activeVideoId === id ? null : state.activeVideoId;
    
    return { 
      playingVideos: newPlayingVideos,
      activeVideoId: newActiveVideoId
    };
  }),
  
  setReadyToPlayFromAudio: (ready: boolean) => set({ readyToPlayFromAudio: ready }),
  
  setUserPaused: (id: string, paused: boolean) => set((state: VideoState) => {
    if (!id) return state;

    console.log(`Video ${id}: User Paused = ${paused}`);
    const newUserPausedVideos = new Set(state.userPausedVideos);
    
    if (paused) {
      newUserPausedVideos.add(id);
      // Wenn das Video pausiert wird, aus der playingVideos entfernen
      const newPlayingVideos = new Set(state.playingVideos);
      newPlayingVideos.delete(id);
      return { 
        userPausedVideos: newUserPausedVideos,
        playingVideos: newPlayingVideos
      };
    } else {
      newUserPausedVideos.delete(id);
      return { userPausedVideos: newUserPausedVideos };
    }
  }),

  initializeVideo: (id: string) => set((state: VideoState) => {
    if (!id) return state;

    console.log(`Video ${id}: Initialize`);
    const newInitializedVideos = new Set(state.initializedVideos);
    newInitializedVideos.add(id);
    
    // Beim Initialisieren auch als pausiert markieren
    const newUserPausedVideos = new Set(state.userPausedVideos);
    newUserPausedVideos.add(id);
    
    return { 
      initializedVideos: newInitializedVideos,
      userPausedVideos: newUserPausedVideos
    };
  }),
  
  isVideoPlaying: (id: string) => get().playingVideos.has(id),
  
  isUserPaused: (id: string) => get().userPausedVideos.has(id),

  isVideoInitialized: (id: string) => get().initializedVideos.has(id),

  resetState: () => set(initialState),
})); 