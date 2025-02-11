import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import transcriptData from '../transciption_data/transcript_elli_scene_01.json';
import '../styles/AudioScene.css';
import { useGSAP } from '@gsap/react';
import { useApp, SceneId } from '../context/AppContext';
import { withSceneControl, BaseSceneProps, SceneController } from '../hoc/withSceneControl';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface AudioSceneProps extends BaseSceneProps {
  controller?: SceneController;
  isPlaying?: boolean;
  onAnimationComplete?: () => void;
  isAnimationScene?: boolean;
  setIsAnimationScene?: (value: boolean) => void;
  isActive?: boolean;
}

const AudioScene: React.FC<AudioSceneProps> = ({
  id,
  controller,
  onComplete,
  isPlaying = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const splitRef = useRef<SplitType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const { dispatch } = useApp();
  const sceneId: SceneId = 'audio-scene';

  // Audio laden und initialisieren
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    audio.load();
    
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
    
    audio.addEventListener('canplay', handleCanPlay);
    
    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [dispatch]);

  // Text Animation Setup
  useEffect(() => {
    if (!textContainerRef.current || !isLoaded) return;

    // Container vorbereiten
    textContainerRef.current.innerHTML = 
      '<div class="text">Hey, ich bin Elli. Vor genau 89 Tagen habe ich alles Vertraute gegen Berlin eingetauscht. Naja, fast alles. Mein Morgenritual zum Beispiel habe ich einfach mitgenommen.</div>';

    // Text mit SplitType aufteilen
    if (splitRef.current) {
      splitRef.current.revert();
    }

    splitRef.current = new SplitType('.text', {
      types: 'words,chars',
      tagName: 'span'
    });

    // Timeline erstellen
    const timeline = gsap.timeline({ 
      paused: true,
      defaults: {
        ease: "power4.out",
        duration: 0.6
      }
    });

    timelineRef.current = timeline;

    // Initial states
    gsap.set(splitRef.current.chars, { 
      opacity: 0,
      scale: 0.3,
      filter: 'blur(10px)',
      display: 'inline-block',
      transformOrigin: 'center center'
    });

    // Text Segmente verarbeiten
    const segments = transcriptData.segments;
    
    // Wörter den Segmenten zuordnen
    splitRef.current.words?.forEach((word, wordIndex) => {
      // Finde das passende Segment für dieses Wort
      let currentPosition = 0;
      let segmentStart = 0;
      let segmentIndex = 0;

      // Durchlaufe die Segmente, bis wir das richtige für dieses Wort finden
      for (let i = 0; i < segments.length; i++) {
        const segmentWords = segments[i].text.split(' ');
        if (currentPosition + segmentWords.length > wordIndex) {
          segmentIndex = i;
          segmentStart = segments[i].start;
          break;
        }
        currentPosition += segmentWords.length;
      }

      // Berechne die relative Position des Wortes im Segment
      const relativeWordIndex = wordIndex - currentPosition;
      const startTime = segmentStart + (relativeWordIndex * 0.15);

      // Hole alle Buchstaben des Wortes
      const chars = word.querySelectorAll('.char');

      // Animiere jeden Buchstaben des Wortes
      chars.forEach((char, charIndex) => {
        const charStartTime = startTime + (charIndex * 0.04);

        timeline.to(char, {
          opacity: 1,
          scale: 1.4,
          filter: 'blur(0px)',
          duration: 0.5,
          ease: "back.out(1.7)",
        }, charStartTime);

        timeline.to(char, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        }, charStartTime + 0.3);
      });

      timeline.to(word, {
        color: '#ffffff',
        textShadow: '0 0 20px rgba(255,255,255,0.6)',
        duration: 0.4,
        ease: "power2.inOut"
      }, startTime + 0.2);

      timeline.to(word, {
        color: '#ffffff',
        textShadow: '0 0 15px rgba(255,255,255,0.3)',
        duration: 0.4,
        ease: "power2.inOut"
      }, startTime + 0.7);
    });

    return () => {
      if (splitRef.current) {
        splitRef.current.revert();
      }
      timeline.kill();
    };
  }, [isLoaded]);

  // Audio und Animation Control
  useEffect(() => {
    if (!audioRef.current || !isLoaded || !timelineRef.current) return;

    const audio = audioRef.current;
    const timeline = timelineRef.current;

    const handleTimeUpdate = () => {
      timeline.seek(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
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
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    if (isPlaying) {
      audio.play().catch(error => {
        console.warn('Audio autoplay failed:', error);
      });
      timeline.play();
    } else {
      audio.pause();
      timeline.pause();
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isPlaying, isLoaded, onComplete, dispatch]);

  const togglePlay = () => {
    if (isPlaying) {
      controller?.pause();
    } else {
      controller?.play();
    }
  };

  return (
    <div ref={containerRef} className={`audio-scene ${isPlaying ? 'active' : ''}`}>
      <div ref={textContainerRef} className="text-container" />
      <div className="audio-container">
        <audio
          ref={audioRef}
          src="/audio/elli_scene_01.mp3"
          preload="auto"
        />
        
        <div className="audio-controls">
          <button
            onClick={togglePlay}
            className={`control-button ${isPlaying ? 'playing' : ''}`}
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
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const WrappedAudioScene = withSceneControl(AudioScene, {
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

export default WrappedAudioScene; 