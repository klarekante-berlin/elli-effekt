import { createContext, useContext } from "react";
import { SceneId } from "./AppContext";

// src/contexts/SceneContext.tsx
interface SceneContextValue {
    id: SceneId;
    isActive: boolean;
    isAnimating: boolean;
    snapIntoPlace: boolean;
    isScrollable: boolean;
}

const SceneContext = createContext<SceneContextValue | undefined>(undefined);

export const useScene = () => {
    const context = useContext(SceneContext);
    if (!context) {
        throw new Error('useScene must be used within a SceneProvider');
    }
    return context;
};

interface SceneProviderProps {
    children: React.ReactNode;
    value: SceneContextValue;
}

export const SceneProvider: React.FC<SceneProviderProps> = ({ children, value }) => {
    return (
        <SceneContext.Provider value={value}>
            {children}
        </SceneContext.Provider>
    );
};

export type { SceneContextValue };