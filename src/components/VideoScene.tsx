import React, { useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/lazy';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import videoFrame from '../assets/images/video_frame.png';
import { useVideoStore } from '../stores/videoStore';
import '../styles/VideoScene.css';

gsap.registerPlugin(ScrollTrigger);

interface VideoSceneProps {
  id: string;                    // Eindeutige ID für die Scene
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
  const [isMuted, setIsMuted] = React.useState(startMuted);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isVideoReady, setIsVideoReady] = React.useState(false);

  // Zustand Store
  const {
    isVideoPlaying,
    isUserPaused,
    playVideo,
    pauseVideo,
    setUserPaused,
    setReadyToPlayFromAudio,
    initializeVideo,
    isVideoInitialized
  } = useVideoStore();

  // Initialisierung
  useEffect(() => {
    console.log(`Video ${id}: Mount`);
    if (!isVideoInitialized(id)) {
      console.log(`Video ${id}: Initialisiere`);
      initializeVideo(id);
      // Setze initial auf pausiert
      setUserPaused(id, true);
    }

    return () => {
      console.log(`Video ${id}: Unmount`);
      pauseVideo(id);
    };
  }, [id]);

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
    if (!containerRef.current || !isVideoReady) return;

    console.log(`Video ${id}: ScrollTrigger Setup`);
    
    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: () => {
        console.log(`Video ${id}: Enter - Start Playing`);
        setUserPaused(id, false); // Erlaube Autoplay beim Scrollen
        playVideo(id);
      },
      onLeave: () => {
        console.log(`Video ${id}: Leave - Pause`);
        pauseVideo(id);
      },
      onEnterBack: () => {
        console.log(`Video ${id}: Enter Back - Start Playing`);
        setUserPaused(id, false); // Erlaube Autoplay beim Scrollen
        playVideo(id);
      },
      onLeaveBack: () => {
        console.log(`Video ${id}: Leave Back - Pause`);
        pauseVideo(id);
      },
      onUpdate: (self) => {
        // Prüfe ob die Szene aktuell sichtbar ist
        if (self.isActive && !isVideoPlaying(id) && !isUserPaused(id)) {
          console.log(`Video ${id}: Scene visible - Start Playing`);
          playVideo(id);
        }
      }
    });

    return () => {
      console.log(`Video ${id}: ScrollTrigger Cleanup`);
      trigger.kill();
    };
  }, [id, isVideoReady]);

  // Effekt für isReadyToPlay (nach Audio) - nur für spezielle Audio-getriggerte Szenen
  useEffect(() => {
    if (isReadyToPlay) {
      console.log(`Video ${id}: Ready to play from audio`);
      setReadyToPlayFromAudio(true);
      setUserPaused(id, false); // Erlaube Autoplay nach Audio
    }
  }, [isReadyToPlay, id]);

  const handleVideoReady = () => {
    console.log(`Video ${id}: Ready`);
    setIsVideoReady(true);
    // NICHT automatisch abspielen wenn bereit
  };

  const handleVideoError = (error: unknown) => {
    console.error(`Video ${id} error:`, error);
    setIsVideoReady(false);
  };

  const handlePlayPause = () => {
    if (isVideoPlaying(id)) {
      console.log(`Video ${id}: Manual Pause`);
      pauseVideo(id);
      setUserPaused(id, true);
    } else {
      console.log(`Video ${id}: Manual Play`);
      setUserPaused(id, false);
      playVideo(id);
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

  const handleVideoEnd = () => {
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
            playing={isVideoPlaying(id)}
            loop={loop}
            muted={isMuted}
            width="100%"
            height="100%"
            playsinline
            className="react-player"
            onReady={handleVideoReady}
            onError={handleVideoError}
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
              aria-label={isVideoPlaying(id) ? 'Pause' : 'Play'}
            >
              {isVideoPlaying(id) ? <Pause size={24} /> : <Play size={24} />}
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