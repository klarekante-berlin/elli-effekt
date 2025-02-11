import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useVideoControl } from '../hooks/useVideoControl';
import '../styles/VideoScene.css';

gsap.registerPlugin(ScrollTrigger);

interface VideoSceneProps {
  id: string;
  videoSource: string;
  isReadyToPlay: boolean;
  onComplete: () => void;
  showControls?: boolean;
  loop?: boolean;
  showFrame?: boolean;
  startMuted?: boolean;
}

const VideoScene: React.FC<VideoSceneProps> = ({
  id,
  videoSource,
  isReadyToPlay,
  onComplete,
  showControls = true,
  loop = false,
  showFrame = true,
  startMuted = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isPlaying, isLoaded, handlePlay, handlePause } = useVideoControl({
    videoRef,
    isReadyToPlay,
    onComplete
  });

  useGSAP(() => {
    if (!containerRef.current) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top center',
        end: 'bottom center',
        onEnter: handlePlay,
        onLeave: handlePause,
        onEnterBack: handlePlay,
        onLeaveBack: handlePause,
        markers: true,
        toggleActions: 'restart pause resume pause'
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && isLoaded) {
            handlePlay();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    timeline
      .fromTo(containerRef.current, 
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1 }
      );

    return () => {
      timeline.kill();
      observer.disconnect();
    };
  }, { scope: containerRef, dependencies: [isLoaded] });

  return (
    <div ref={containerRef} id={id} className="video-scene">
      <div className={`video-container ${showFrame ? 'with-frame' : ''}`}>
        <video
          ref={videoRef}
          className="video-element"
          src={videoSource}
          controls={showControls}
          loop={loop}
          muted={startMuted}
          playsInline
        />
        {!isLoaded && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
          </div>
        )}
        {isLoaded && !isPlaying && (
          <div className="play-overlay">
            <button 
              className="play-button"
              onClick={handlePlay}
              aria-label="Video abspielen"
            >
              ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoScene; 