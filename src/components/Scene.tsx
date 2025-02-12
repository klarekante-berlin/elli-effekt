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
    children: ReactNode;
    onActivate?: () => void;
    onDeactivate?: () => void;
}

export const Scene: FC<SceneProps> = ({
    id,
    snapIntoPlace = false,
    children,
    onActivate,
    onDeactivate
}) => {
    const { state, dispatch } = useApp();
    const containerRef = useRef<HTMLDivElement>(null);
    const lenis = useLenis();
    
    const { isScrolling, setIsScrolling, isAnimationScene, setIsAnimationScene } = useScrollSnapping(
        snapIntoPlace ? lenis : null
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
            onLeaveBack: handleSceneDeactivation
        });

        return () => {
            trigger.kill();
        };
    }, [handleSceneActivation, handleSceneDeactivation]);

    const sceneContextValue = {
        id: id as SceneId,
        isActive: state.currentScene === id,
        isAnimating: isScrolling,
        snapIntoPlace
    };

    return (
        <section 
            ref={containerRef} 
            className={`scene scene-${id}${snapIntoPlace ? ' snap-scene' : ''}`}
            data-scene-id={id}
            data-scene-active={state.currentScene === id}
        >
            <SceneProvider value={sceneContextValue}>
                {children}
            </SceneProvider>
        </section>
    );
};