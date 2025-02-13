// src/components/Scene.tsx
import { FC, ReactNode, useRef, useEffect, useCallback } from 'react';
import { useApp, SceneId } from '../context/AppContext';
import { SceneProvider } from '../context/SceneContext';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';
import { useScrollSnapping } from '../hooks/useScrollSnapping';

interface SceneProps {
    id: string;
    snapIntoPlace?: boolean;
    isScrollable?: boolean;
    children: ReactNode;
    onActivate?: () => void;
    onDeactivate?: () => void;
}

export const Scene: FC<SceneProps> = ({
    id,
    snapIntoPlace = false,
    isScrollable = false,
    children,
    onActivate,
    onDeactivate
}) => {
    const { state, dispatch } = useApp();
    const containerRef = useRef<HTMLDivElement>(null);
    const lenis = useLenis();
    
    const { isScrolling, setIsScrolling, isAnimationScene, setIsAnimationScene } = useScrollSnapping(
        (!isScrollable && snapIntoPlace) ? lenis : null
    );

    const handleSceneActivation = useCallback(() => {
        dispatch({ type: 'SET_CURRENT_SCENE', payload: id as SceneId });
        onActivate?.();
    }, [id, dispatch, onActivate]);

    const handleSceneDeactivation = useCallback(() => {
        if (state.currentScene === id) {
            dispatch({ type: 'SET_CURRENT_SCENE', payload: null });
        }
        onDeactivate?.();
    }, [id, state.currentScene, dispatch, onDeactivate]);
    
    useEffect(() => {
        const trigger = ScrollTrigger.create({
            trigger: containerRef.current,
            start: 'top center',
            end: 'bottom center',
            onEnter: handleSceneActivation,
            onEnterBack: handleSceneActivation,
            onLeave: handleSceneDeactivation,
            onLeaveBack: handleSceneDeactivation,
            onUpdate: (self) => {
                if (isScrollable) {
                    // Wenn wir uns der scrollbaren Szene nähern (ab 50% Sichtbarkeit)
                    if (self.progress > 0.5 && !state.isSnappingDisabled) {
                        dispatch({ type: 'SET_SNAPPING_ENABLED', payload: false });
                    }
                    // Wenn wir uns von der scrollbaren Szene entfernen (unter 50% Sichtbarkeit)
                    else if (self.progress < 0.5 && state.isSnappingDisabled) {
                        dispatch({ type: 'SET_SNAPPING_ENABLED', payload: true });
                    }
                }
            }
        });

        return () => {
            trigger.kill();
        };
    }, [handleSceneActivation, handleSceneDeactivation, isScrollable, dispatch, state.isSnappingDisabled]);

    const sceneContextValue = {
        id: id as SceneId,
        isActive: state.currentScene === id,
        isAnimating: isScrolling,
        snapIntoPlace,
        isScrollable
    };

    return (
        <section 
            ref={containerRef} 
            className={`scene scene-${id}${snapIntoPlace && !isScrollable ? ' snap-scene' : ''}`}
            data-scene-id={id}
            data-scene-active={state.currentScene === id}
            data-scrollable={isScrollable}
        >
            <SceneProvider value={sceneContextValue}>
                {children}
            </SceneProvider>
        </section>
    );
};