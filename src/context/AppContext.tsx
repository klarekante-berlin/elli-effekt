import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export type SceneId = 
  | 'welcome-scene'
  | 'audio-scene'
  | 'video-scene'
  | 'chat-scene'
  | 'avocado-scene'
  | null;

type NonNullSceneId = Exclude<SceneId, null>;

interface SceneState {
  isReady: boolean;
  isActive: boolean;
  isComplete: boolean;
  isAnimated: boolean;
  requiresSnapping: boolean;
}

interface VideoState {
  isReady: boolean;
  isComplete: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  shouldAutoplay: boolean;
  isScrollTriggered: boolean;
  metadata: {
    duration: number;
    currentTime: number;
    playbackRate: number;
    volume: number;
  };
}

interface AppState {
  currentScene: SceneId;
  previousScene: SceneId;
  isScrolling: boolean;
  isAnimationScene: boolean;
  isInitialized: boolean;
  sceneStates: Record<NonNullSceneId, SceneState>;
  videoStates: Record<'video-scene', VideoState>;
}

// Actions
type AppAction = 
  | { type: 'SET_CURRENT_SCENE'; payload: SceneId }
  | { type: 'SET_IS_SCROLLING'; payload: boolean }
  | { type: 'SET_IS_ANIMATION_SCENE'; payload: boolean }
  | { type: 'INITIALIZE' }
  | { type: 'UPDATE_SCENE_STATE'; payload: { sceneId: SceneId; updates: Partial<SceneState> } }
  | { type: 'UPDATE_VIDEO_STATE'; payload: { updates: Partial<VideoState> } };

// Initial State
const initialVideoState: VideoState = {
  isReady: false,
  isComplete: false,
  isPlaying: false,
  isMuted: false,
  shouldAutoplay: false,
  isScrollTriggered: false,
  metadata: {
    duration: 0,
    currentTime: 0,
    playbackRate: 1,
    volume: 1
  }
};

const initialSceneState: SceneState = {
  isReady: false,
  isActive: false,
  isComplete: false,
  isAnimated: false,
  requiresSnapping: true
};

const initialState: AppState = {
  currentScene: null,
  previousScene: null,
  isScrolling: false,
  isAnimationScene: false,
  isInitialized: false,
  sceneStates: {
    'welcome-scene': { ...initialSceneState },
    'audio-scene': { ...initialSceneState },
    'video-scene': { ...initialSceneState },
    'chat-scene': { ...initialSceneState },
    'avocado-scene': { ...initialSceneState }
  },
  videoStates: {
    'video-scene': initialVideoState
  }
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_SCENE':
      return {
        ...state,
        previousScene: state.currentScene,
        currentScene: action.payload
      };
    
    case 'SET_IS_SCROLLING':
      return {
        ...state,
        isScrolling: action.payload
      };
    
    case 'SET_IS_ANIMATION_SCENE':
      return {
        ...state,
        isAnimationScene: action.payload
      };
    
    case 'INITIALIZE':
      return {
        ...state,
        isInitialized: true,
        currentScene: 'welcome-scene',
        sceneStates: {
          ...state.sceneStates,
          'welcome-scene': {
            ...state.sceneStates['welcome-scene'],
            isReady: true,
            isActive: true
          }
        }
      };
    
    case 'UPDATE_SCENE_STATE':
      if (!action.payload.sceneId) return state;
      return {
        ...state,
        sceneStates: {
          ...state.sceneStates,
          [action.payload.sceneId as NonNullSceneId]: {
            ...state.sceneStates[action.payload.sceneId as NonNullSceneId],
            ...action.payload.updates
          }
        }
      };
    
    case 'UPDATE_VIDEO_STATE':
      return {
        ...state,
        videoStates: {
          ...state.videoStates,
          'video-scene': {
            ...state.videoStates['video-scene'],
            ...action.payload.updates
          }
        }
      };
    
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks
export function useCurrentScene() {
  const { state } = useApp();
  return state.currentScene;
}

export function useSceneState(sceneId: SceneId) {
  const { state } = useApp();
  return sceneId && sceneId !== null ? state.sceneStates[sceneId] : null;
}

export function useVideoState() {
  const { state } = useApp();
  return state.videoStates['video-scene'];
}

export function useIsScrolling() {
  const { state } = useApp();
  return state.isScrolling;
}

export function useIsAnimationScene() {
  const { state } = useApp();
  return state.isAnimationScene;
} 