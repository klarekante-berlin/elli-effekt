import React, { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp, SceneId } from '../context/AppContext';
import { withSceneControl, BaseSceneProps, SceneController } from '../hoc/withSceneControl';
import '../styles/VideoScene.css';

gsap.registerPlugin(ScrollTrigger);

interface VideoSceneProps extends BaseSceneProps {
  controller?: SceneController;
  isPlaying?: boolean;
  videoSource: string;
  showControls?: boolean;
  loop?: boolean;
  showFrame?: boolean;
  startMuted?: boolean;
  isReadyToPlay?: boolean;
  isActive?: boolean;
}

const VideoScene: React.FC<VideoSceneProps> = ({
  id,
  controller,
  onComplete,
  isPlaying = false,
  videoSource,
  showControls = false,
  loop = false,
  showFrame = false,
  startMuted = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(startMuted);

  const { dispatch } = useApp();
  const sceneId: SceneId = 'video-scene';

  // Video laden und initialisieren
  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    video.load();
    
    const handleCanPlay = () => {
      setIsLoaded(true);
      dispatch({
        type: 'UPDATE_SCENE_STATE',
        payload: {
          sceneId,
          updates: { isReady: true }
        }
      });
    };
    
    video.addEventListener('canplay', handleCanPlay);
    
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [dispatch]);

  // Video Control
  useEffect(() => {
    if (!videoRef.current || !isLoaded) return;

    const video = videoRef.current;

    const handleEnded = () => {
      if (!loop) {
        dispatch({
          type: 'UPDATE_SCENE_STATE',
          payload: {
            sceneId,
            updates: { isComplete: true, isActive: false }
          }
        });
        if (onComplete) {
          onComplete();
        }
      }
    };
    
    video.addEventListener('ended', handleEnded);

    if (isPlaying) {
      video.play().catch(error => {
        console.warn('Video autoplay failed:', error);
        setIsMuted(true);
        video.play();
      });
    } else {
      video.pause();
    }

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [isPlaying, isLoaded, loop, onComplete, dispatch]);

  const togglePlay = () => {
    if (isPlaying) {
      controller?.pause();
    } else {
      controller?.play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className={`video-scene ${showFrame ? 'with-frame' : ''} ${isPlaying ? 'active' : ''}`}>
      <div className="video-container">
        <video
          ref={videoRef}
          className="video-element"
          playsInline
          muted={isMuted}
          loop={loop}
          onClick={togglePlay}
        >
          <source src={videoSource} type="video/mp4" />
          Ihr Browser unterstützt das Video-Tag nicht.
        </video>
        
        {showControls && (
          <div className="video-controls">
            <button 
              onClick={togglePlay}
              className="control-button"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>
            
            <button
              onClick={toggleMute}
              className="control-button"
              aria-label={isMuted ? 'Ton an' : 'Ton aus'}
            >
              {isMuted ? (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M3,9H7L12,4V20L7,15H3V9Z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M3,9H7L12,4V20L7,15H3V9Z" />
                  <path d="M16,9C17.66,9 19,10.34 19,12C19,13.66 17.66,15 16,15" />
                  <path d="M19,6C21.76,6 24,8.24 24,12C24,15.76 21.76,18 19,18" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const WrappedVideoScene = withSceneControl(VideoScene, {
  setupScene: (controller) => {
    return {
      onEnter: () => {
        controller.play();
      },
      onLeave: () => {
        controller.pause();
      },
      onEnterBack: () => {
        controller.play();
      },
      onLeaveBack: () => {
        controller.pause();
      }
    };
  }
});

export default WrappedVideoScene; 