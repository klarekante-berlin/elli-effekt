import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player/lazy';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import videoFrame from '../assets/images/video_frame.png';
import { 
  useVideoStore,
  useIsVideoPlaying,
  useIsVideoMuted,
  useVideoMetadata,
  useIsScrollTriggered,
  type VideoId
} from '../stores/videoStore';
import '../styles/VideoScene.css';

gsap.registerPlugin(ScrollTrigger);

interface VideoSceneProps {
  id: VideoId;                   // Eindeutige ID für die Scene
  videoSource: string;           // Pfad zum Video
  isReadyToPlay?: boolean;       // Startet das Video automatisch nach Audio
  onComplete?: () => void;       // Callback wenn Video fertig ist
  showControls?: boolean;        // Zeigt die Steuerelemente an
  loop?: boolean;                // Video in Schleife abspielen
  showFrame?: boolean;           // Zeigt den Video-Frame an
  startMuted?: boolean;          // Video startet stumm
}

interface ReactPlayerInstance {
  seekTo: (amount: number, type: 'seconds' | 'fraction') => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getInternalPlayer: (key?: string) => any;
}

const VideoScene: React.FC<VideoSceneProps> = ({
  id,
  videoSource,
  isReadyToPlay = false,
  onComplete,
  showControls = true,
  loop = false,
  showFrame = true,
  startMuted = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLImageElement>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReactPlayerInstance>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Video Store Hooks
  const isPlaying = useIsVideoPlaying(id);
  const isMuted = useIsVideoMuted(id);
  const metadata = useVideoMetadata(id);
  const isScrollTriggered = useIsScrollTriggered(id);
  const {
    play,
    pause,
    togglePlay,
    setMuted,
    toggleMuted,
    updateMetadata,
    markVideoAsReady,
    markVideoAsComplete,
    setScrollTriggered,
    initialize
  } = useVideoStore();

  // Initialisierung
  useEffect(() => {
    console.log(`Video ${id}: Mount`);
    
    // Initialisiere den Store und setze alle States zurück
    initialize();
    
    // Explizit alle States zurücksetzen
    setScrollTriggered(id, false);
    pause(id);
    setMuted(id, startMuted);
    
    return () => {
      console.log(`Video ${id}: Unmount`);
      setScrollTriggered(id, false);
      pause(id);
    };
  }, [id, initialize, setScrollTriggered, pause, setMuted, startMuted]);

  // Touch-Event-Handler
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const touchTime = Date.now();

      const handleTouchEnd = (e: TouchEvent) => {
        const touchEndY = e.changedTouches[0].clientY;
        const touchDuration = Date.now() - touchTime;
        const touchDistance = Math.abs(touchEndY - touchY);

        if (touchDuration < 250 && touchDistance < 10) {
          handlePlayPause();
        }
      };

      document.addEventListener('touchend', handleTouchEnd, { once: true });
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart);
    }

    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
      }
    };
  }, []);

  // ScrollTrigger für Sichtbarkeit
  useEffect(() => {
    if (!containerRef.current || !isVideoReady) {
      console.log(`Video ${id}: ScrollTrigger Setup waiting:`, {
        hasContainer: !!containerRef.current,
        isVideoReady,
        documentReady: document.readyState
      });
      return;
    }

    console.log(`Video ${id}: ScrollTrigger Setup starting`);
    
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top center",
      end: "bottom center",
      scrub: false,
      onEnter: () => {
        console.log(`Video ${id}: Enter - Attempting to play`);
        requestAnimationFrame(() => {
          setScrollTriggered(id, true);
        });
      },
      onLeave: () => {
        console.log(`Video ${id}: Leave - Pausing`);
        requestAnimationFrame(() => {
          setScrollTriggered(id, false);
        });
      },
      onEnterBack: () => {
        console.log(`Video ${id}: Enter Back - Attempting to resume`);
        requestAnimationFrame(() => {
          setScrollTriggered(id, true);
        });
      },
      onLeaveBack: () => {
        console.log(`Video ${id}: Leave Back - Pausing`);
        requestAnimationFrame(() => {
          setScrollTriggered(id, false);
        });
      }
    });

    // ScrollTrigger sofort refreshen
    ScrollTrigger.refresh();

    return () => {
      console.log(`Video ${id}: ScrollTrigger Cleanup`);
      trigger.kill();
    };
  }, [id, isVideoReady, setScrollTriggered]);

  // Effekt für isReadyToPlay (nach Audio)
  useEffect(() => {
    if (isReadyToPlay && isVideoReady) {
      console.log(`Video ${id}: Ready to play from audio`);
      requestAnimationFrame(() => {
        setScrollTriggered(id, true);
      });
    }
  }, [isReadyToPlay, isVideoReady, id, setScrollTriggered]);

  const handleVideoReady = () => {
    console.log(`Video ${id}: Ready Event`, {
      currentTime: playerRef.current?.getCurrentTime(),
      duration: playerRef.current?.getDuration()
    });
    
    setIsVideoReady(true);
    markVideoAsReady(id);
    
    // ScrollTrigger sofort refreshen
    ScrollTrigger.refresh();
  };

  const handleVideoError = (error: unknown) => {
    console.error(`Video ${id} error:`, error);
    setIsVideoReady(false);
  };

  const handlePlayPause = () => {
    console.log(`Video ${id}: Toggle Play/Pause`);
    togglePlay(id);
  };

  const handleVolumeToggle = () => {
    console.log(`Video ${id}: Toggle Volume`);
    toggleMuted(id);
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

  const handleProgress = ({ played, playedSeconds }: { played: number, playedSeconds: number }) => {
    updateMetadata(id, {
      currentTime: playedSeconds
    });
  };

  const handleDuration = (duration: number) => {
    updateMetadata(id, {
      duration
    });
  };

  const handleVideoEnd = () => {
    console.log(`Video ${id}: Complete`);
    markVideoAsComplete(id);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div 
      id={id}
      className="video-scene" 
      ref={containerRef}
    >
      <div className="frame-container">
        <div 
          ref={playerWrapperRef} 
          className="player-wrapper"
        >
          <ReactPlayer
            ref={playerRef}
            url={videoSource}
            playing={isPlaying && isScrollTriggered}
            loop={loop}
            muted={isMuted}
            volume={metadata.volume}
            playbackRate={metadata.playbackRate}
            width="100%"
            height="100%"
            playsinline
            className="react-player"
            onReady={handleVideoReady}
            onError={handleVideoError}
            onProgress={handleProgress}
            onDuration={handleDuration}
            onPlay={() => console.log(`Video ${id}: Actually started playing`)}
            onPause={() => console.log(`Video ${id}: Actually paused`)}
            onEnded={handleVideoEnd}
            config={{
              file: {
                attributes: {
                  crossOrigin: "anonymous"
                }
              }
            }}
          />
        </div>
        {showFrame && (
          <img 
            ref={frameRef}
            src={videoFrame} 
            alt="Video Frame" 
            className="video-frame"
          />
        )}
        {showControls && (
          <div className="video-controls">
            <button 
              onClick={handlePlayPause} 
              className="control-button"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
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
        )}
      </div>
    </div>
  );
};

export default VideoScene; 