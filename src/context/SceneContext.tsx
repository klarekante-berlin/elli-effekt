import { createContext, useContext, useReducer, ReactNode, FC, useEffect, useCallback } from 'react';
import { SceneId } from '../App'; // Import SceneId from App

interface SceneConfig {
  id: Exclude<SceneId, null>;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  snapIntoPlace?: boolean;
  isScrollable?: boolean;
}

interface SceneState {
  currentScene: SceneId;
  scenes: Record<Exclude<SceneId, null>, {
    isActive: boolean;
    isAnimating: boolean;
    snapIntoPlace: boolean;
    isScrollable: boolean;
  }>;
}

type SceneAction =
  | { type: 'UPDATE_SCENE'; payload: { id: SceneId; updates: Partial<SceneState['scenes'][Exclude<SceneId, null>]> } }
  | { type: 'SET_CURRENT_SCENE'; payload: SceneId }
  | { type: 'HANDLE_SCENE_ACTIVATION'; payload: { id: SceneId; isScrollable: boolean } };

const createInitialState = (scenes: readonly SceneConfig[]): SceneState => {
  const scenesRecord = scenes.reduce((acc, scene) => ({
    ...acc,
    [scene.id]: {
      isActive: false,
      isAnimating: false,
      snapIntoPlace: scene.snapIntoPlace ?? false,
      isScrollable: scene.isScrollable ?? false
    }
  }), {} as SceneState['scenes']);

  return {
    currentScene: null,
    scenes: scenesRecord
  };
};

const sceneReducer = (state: SceneState, action: SceneAction): SceneState => {
  switch (action.type) {
    case 'HANDLE_SCENE_ACTIVATION':
      const { id, isScrollable } = action.payload;
      if (!id || id === null) return state;
      
      const scene = state.scenes[id as Exclude<SceneId, null>];
      if (!scene) return state;

      // Immer snapIntoPlace true für initiales Snapping
      return {
        ...state,
        currentScene: id,
        scenes: {
          ...state.scenes,
          [id]: {
            ...scene,
            isActive: true,
            snapIntoPlace: true // Immer initial true
          }
        }
      };

    case 'UPDATE_SCENE':
      if (!action.payload.id || action.payload.id === null) return state;
      const sceneId = action.payload.id as Exclude<SceneId, null>;
      const currentScene = state.scenes[sceneId];
      
      // Wenn die Scene scrollbar ist und aktiviert wird,
      // starten wir den Timer für das Deaktivieren des Snappings
      if (
        currentScene?.isScrollable && 
        action.payload.updates.isActive && 
        currentScene.snapIntoPlace
      ) {
        return {
          ...state,
          scenes: {
            ...state.scenes,
            [sceneId]: {
              ...currentScene,
              ...action.payload.updates,
              snapIntoPlace: true // Behalte Snapping zunächst bei
            }
          }
        };
      }

      return {
        ...state,
        scenes: {
          ...state.scenes,
          [sceneId]: {
            ...currentScene,
            ...action.payload.updates
          }
        }
      };

    case 'SET_CURRENT_SCENE':
      return {
        ...state,
        currentScene: action.payload
      };

    default:
      return state;
  }
};

interface SceneContextValue {
  state: SceneState;
  dispatch: React.Dispatch<SceneAction>;
  useSceneStatus: (sceneId: SceneId) => { isActive: boolean };
}

export const SceneContext = createContext<SceneContextValue>({
  state: {} as SceneState,
  dispatch: () => null,
  useSceneStatus: () => ({ isActive: false })
});

interface SceneProviderProps {
  children: ReactNode;
  scenes: readonly SceneConfig[];
}

export const SceneProvider: FC<SceneProviderProps> = ({ children, scenes }) => {
  const [state, dispatch] = useReducer(sceneReducer, scenes, createInitialState);

  const useSceneStatus = useCallback((sceneId: SceneId) => ({
    isActive: sceneId ? state.scenes[sceneId]?.isActive ?? false : false
  }), [state.scenes]);

  return (
    <SceneContext.Provider value={{ state, dispatch, useSceneStatus }}>
      {children}
    </SceneContext.Provider>
  );
};

export const useScene = () => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useScene must be used within a SceneProvider');
  }
  return context;
};

// Separate hook for scene state
export const useSceneState = () => {
  const context = useScene();
  const { currentId, state } = context;
  if (currentId && currentId in state.scenes) {
    return state.scenes[currentId as Exclude<SceneId, null>];
  }
  return null;
};

interface SceneContextProviderProps {
  children: ReactNode;
  id: SceneId;
}

export const SceneContextProvider: React.FC<SceneContextProviderProps> = ({ children, id }) => {
  const parentContext = useScene();
  
  return (
    <SceneContext.Provider value={{ ...parentContext, currentId: id }}>
      {children}
    </SceneContext.Provider>
  );
};