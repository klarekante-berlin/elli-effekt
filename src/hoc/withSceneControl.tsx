import React from 'react';
import { useSceneControl, SceneControlOptions, SceneController } from '../hooks/useSceneControl';

export type BaseSceneProps = Omit<SceneControlOptions, 'setupScene' | 'cleanupScene'> & {
  className?: string;
};

export type { SceneController };

export const withSceneControl = <P extends BaseSceneProps>(
  WrappedComponent: React.ComponentType<P>,
  options: Pick<SceneControlOptions, 'setupScene' | 'cleanupScene'> = {}
) => {
  return function WithSceneControlComponent(props: P) {
    const {
      id,
      onComplete,
      autoStart = true,
      scrollTriggerOptions = {},
      handleTouch = false,
      snapIntoPlace = false,
      className,
      ...rest
    } = props;

    const { containerRef, controller, isPlaying } = useSceneControl({
      id,
      onComplete,
      autoStart,
      scrollTriggerOptions,
      handleTouch,
      snapIntoPlace,
      ...options
    });

    return (
      <div 
        ref={containerRef} 
        className={`scene scene-${id}${className ? ` ${className}` : ''}`}
      >
        <WrappedComponent
          {...(rest as P)}
          id={id}
          onComplete={onComplete}
          controller={controller}
          isPlaying={isPlaying}
        />
      </div>
    );
  };
};

export default withSceneControl; 