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

  useEffect(() => {
    if (!containerRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: () => {
        console.log('Video Scene: Enter');
        setIsInView(true);
        if (!userPaused && isVideoReady) {
          setIsVideoPlaying(true);
        }
      },
      onLeave: () => {
        console.log('Video Scene: Leave');
        setIsInView(false);
        setIsVideoPlaying(false);
      },
      onEnterBack: () => {
        console.log('Video Scene: Enter Back');
        setIsInView(true);
        if (!userPaused && isVideoReady) {
          setIsVideoPlaying(true);
        }
      },
      onLeaveBack: () => {
        console.log('Video Scene: Leave Back');
        setIsInView(false);
        setIsVideoPlaying(false);
      }
    });

    return () => {
      trigger.kill();
    };
  }, [isVideoReady, userPaused]);

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
    setUserPaused(!isVideoPlaying);
    setIsVideoPlaying(!isVideoPlaying);
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
            onPlay={() => console.log('Video started playing')}
            onPause={() => console.log('Video paused')}
            config={{
              file: {
                attributes: {
                  crossOrigin: "anonymous"
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
          <button onClick={handlePlayPause} className="control-button">
            {isVideoPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button onClick={handleVolumeToggle} className="control-button">
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <button onClick={handleFullscreenToggle} className="control-button">
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoScene; 