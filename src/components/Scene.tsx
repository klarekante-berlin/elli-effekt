// src/components/Scene.tsx
import { FC, ReactNode, useRef, useEffect, useCallback } from 'react';
import { useSceneState, useScene } from '../context/SceneContext';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';
import { useScrollSnapping } from '../hooks/useScrollSnapping';
import { SceneId } from '../App';
import { SceneContextProvider } from '../context/SceneContext';

interface SceneProps {
    id: SceneId;
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
    const { state, dispatch } = useScene();
    const containerRef = useRef<HTMLDivElement>(null);
    const lenis = useLenis();
    const { isActive = false } = useSceneState() ?? {};
    const hasSnapped = useRef(false);
    
    const { isScrolling } = useScrollSnapping(
        (snapIntoPlace) ? lenis : null
    );

    const handleSceneActivation = useCallback(() => {
        dispatch({
            type: 'HANDLE_SCENE_ACTIVATION',
            payload: {
                id,
                isScrollable
            }
        });

        dispatch({
            type: 'UPDATE_SCENE',
            payload: {
                id,
                updates: { 
                    isActive: true,
                    isAnimating: isScrolling
                }
            }
        });

        dispatch({ type: 'SET_CURRENT_SCENE', payload: id });
        onActivate?.();
    }, [id, dispatch, isScrolling, isScrollable, onActivate]);

    const handleSceneDeactivation = useCallback(() => {
        hasSnapped.current = false;
        dispatch({
            type: 'UPDATE_SCENE',
            payload: {
                id,
                updates: { 
                    isActive: false,
                    isAnimating: false,
                    snapIntoPlace: snapIntoPlace
                }
            }
        });
        if (state.currentScene === id) {
            dispatch({ type: 'SET_CURRENT_SCENE', payload: null });
        }
        onDeactivate?.();
    }, [id, state.currentScene, dispatch, onDeactivate, snapIntoPlace]);
    
    useEffect(() => {
        if (!containerRef.current) return;

        const trigger = ScrollTrigger.create({
            trigger: containerRef.current,
            start: 'top center',
            end: 'bottom center',
            onEnter: handleSceneActivation,
            onEnterBack: handleSceneActivation,
            onLeave: handleSceneDeactivation,
            onLeaveBack: handleSceneDeactivation,
            // Add markers for debugging if needed
            // markers: true,
        });

        return () => {
            trigger.kill();
        };
    }, [handleSceneActivation, handleSceneDeactivation]);

    return (
        <SceneContextProvider id={id}>
            <div className={`scene scene-${id}${state.scenes[id]?.snapIntoPlace ? ' snap-scene' : ''}`}
                data-scene-id={id}
                data-scene-active={isActive}
                data-scrollable={isScrollable}
                ref={containerRef}
            >
                {children}
            </div>
        </SceneContextProvider>
    );
};