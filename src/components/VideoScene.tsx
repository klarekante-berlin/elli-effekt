import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player/lazy';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import videoFrame from '../assets/images/video_frame.png';
import videoSource from '../assets/videos/WhatIf_Screen_002_Video.mp4';
import '../styles/VideoScene.css';

gsap.registerPlugin(ScrollTrigger);

interface VideoSceneProps {
  isReadyToPlay?: boolean;
}

interface ReactPlayerInstance {
  seekTo: (amount: number, type: 'seconds' | 'fraction') => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getInternalPlayer: (key?: string) => any;
}

const VideoScene: React.FC<VideoSceneProps> = ({ isReadyToPlay = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLImageElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReactPlayerInstance>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [hasStartedFromAudio, setHasStartedFromAudio] = useState(false);
  const wasPlayingBeforeLeave = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const lastTouchTime = useRef<number>(0);

  // Touch-Event-Handler
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      lastTouchTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return;

      const touchEndY = e.changedTouches[0].clientY;
      const touchDuration = Date.now() - lastTouchTime.current;
      const touchDistance = Math.abs(touchEndY - touchStartY.current);

      // Schnelle, kurze Berührungen als Tap behandeln
      if (touchDuration < 250 && touchDistance < 10) {
        handlePlayPause();
      }

      touchStartY.current = null;
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);

  // Effekt für isReadyToPlay Änderungen
  useEffect(() => {
    if (isReadyToPlay && !hasStartedFromAudio) {
      console.log('Starting from audio scene');
      setIsVideoPlaying(true);
      setUserPaused(false);
      setIsInView(true);
      setIsMuted(false);
      setHasStartedFromAudio(true);
    }
  }, [isReadyToPlay, hasStartedFromAudio]);

  // Effekt für Sichtbarkeitsänderungen
  useEffect(() => {
    if (isInView) {
      if (wasPlayingBeforeLeave.current || (isVideoReady && !userPaused)) {
        console.log('Scene in view, resuming video');
        setIsVideoPlaying(true);
        wasPlayingBeforeLeave.current = false;
      }
    } else {
      if (isVideoPlaying) {
        console.log('Scene out of view, pausing video');
        wasPlayingBeforeLeave.current = true;
        setIsVideoPlaying(false);
      }
    }
  }, [isInView, isVideoReady, userPaused, isVideoPlaying]);

  useEffect(() => {
    if (!containerRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: () => {
        console.log('Video Scene: Enter');
        setIsInView(true);
      },
      onLeave: () => {
        console.log('Video Scene: Leave');
        setIsInView(false);
      },
      onEnterBack: () => {
        console.log('Video Scene: Enter Back');
        setIsInView(true);
      },
      onLeaveBack: () => {
        console.log('Video Scene: Leave Back');
        setIsInView(false);
      }
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const handleVideoReady = () => {
    console.log('Video ready');
    setIsVideoReady(true);
    if (isInView && !userPaused) {
      setIsVideoPlaying(true);
    }
  };

  const handleVideoError = (error: unknown) => {
    console.error('Video error:', error);
    setIsVideoReady(false);
  };

  const handlePlayPause = () => {
    console.log('Play/Pause clicked');
    const newPlayingState = !isVideoPlaying;
    setUserPaused(!newPlayingState);
    setIsVideoPlaying(newPlayingState);
    
    if (newPlayingState) {
      wasPlayingBeforeLeave.current = false;
    }
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      id="video-scene" 
      className="video-scene" 
      ref={containerRef}
    >
      <div className="frame-container">
        <div 
          ref={playerWrapperRef} 
          className={`player-wrapper ${isVideoPlaying ? 'playing' : ''}`}
        >
          <ReactPlayer
            ref={playerRef}
            url={videoSource}
            playing={isVideoPlaying}
            loop={true}
            muted={isMuted}
            width="100%"
            height="100%"
            playsinline
            className="react-player"
            onReady={handleVideoReady}
            onError={handleVideoError}
            onPlay={() => console.log('Video actually started playing')}
            onPause={() => console.log('Video actually paused')}
            config={{
              file: {
                attributes: {
                  crossOrigin: "anonymous",
                  playsInline: "true",
                  webkitPlaysinline: "true"
                }
              }
            }}
          />
        </div>
        <img 
          ref={frameRef}
          src={videoFrame} 
          alt="Video Frame" 
          className="video-frame"
        />
        <div className="video-controls">
          <button 
            onClick={handlePlayPause} 
            className="control-button"
            aria-label={isVideoPlaying ? 'Pause' : 'Play'}
          >
            {isVideoPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button 
            onClick={handleVolumeToggle} 
            className="control-button"
            aria-label={isMuted ? 'Ton ein' : 'Ton aus'}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <button 
            onClick={handleFullscreenToggle} 
            className="control-button"
            aria-label={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
          >
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoScene; 