import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import transcriptData from '../transciption_data/transcript_elli_scene_01.json';
import '../styles/AudioScene.css';

gsap.registerPlugin(ScrollTrigger);

interface AudioSceneProps {
  onAnimationComplete?: () => void;
}

const AudioScene: React.FC<AudioSceneProps> = ({ onAnimationComplete }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const splitRef = useRef<SplitType | null>(null);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);

  // Audio laden und vorbereiten
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setIsAudioLoaded(true);
      // Auf iOS initial Play-Button anzeigen
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        setShowPlayButton(true);
      }
    };

    audio.addEventListener('canplay', handleCanPlay);
    return () => audio.removeEventListener('canplay', handleCanPlay);
  }, []);

  // Erweiterte Benutzerinteraktion erkennen
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      setShowPlayButton(false);
    };

    // Touch-Events für mobile Geräte
    const handleTouchStart = (e: TouchEvent) => {
      if (audioRef.current && !hasInteracted) {
        handleInteraction();
        // Audio vorbereiten für iOS
        audioRef.current.load();
        audioRef.current.play().catch(() => {
          setShowPlayButton(true);
        });
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('scroll', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [hasInteracted]);

  // Manueller Start für iOS
  const handleManualPlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setShowPlayButton(false);
          setHasInteracted(true);
          if (timelineRef.current) {
            timelineRef.current.play();
          }
        })
        .catch(error => {
          console.error('Playback failed:', error);
          setShowPlayButton(true);
        });
    }
  };

  // Animation und Audio Setup
  useEffect(() => {
    if (!textContainerRef.current || !isAudioLoaded) return;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

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
    timelineRef.current = gsap.timeline({ 
      paused: true,
      defaults: {
        ease: "power4.out",
        duration: 0.6
      }
    });

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
      const startTime = segmentStart + (relativeWordIndex * 0.15); // 150ms zwischen Wörtern

      // Hole alle Buchstaben des Wortes
      const chars = word.querySelectorAll('.char');

      // Animiere jeden Buchstaben des Wortes
      chars.forEach((char, charIndex) => {
        const charStartTime = startTime + (charIndex * 0.04);

        // Buchstaben einblenden, entblurren und vergrößern
        timelineRef.current?.to(char, {
          opacity: 1,
          scale: 1.4,
          filter: 'blur(0px)',
          duration: 0.5,
          ease: "back.out(1.7)",
        }, charStartTime);

        // Buchstaben auf normale Größe zurückschrumpfen
        timelineRef.current?.to(char, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        }, charStartTime + 0.3);
      });

      // Highlight-Animation für das gesamte Wort
      timelineRef.current?.to(word, {
        color: '#ffffff',
        textShadow: '0 0 20px rgba(255,255,255,0.6)',
        duration: 0.4,
        ease: "power2.inOut"
      }, startTime + 0.2);

      // Highlight zurücksetzen
      timelineRef.current?.to(word, {
        color: '#ffffff',
        textShadow: '0 0 15px rgba(255,255,255,0.3)',
        duration: 0.4,
        ease: "power2.inOut"
      }, startTime + 0.7);
    });

    // ScrollTrigger für automatischen Start
    const trigger = ScrollTrigger.create({
      trigger: "#audio-scene",
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        if (audioRef.current && timelineRef.current) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log("Auto-play prevented:", error);
              // Wenn Autoplay verhindert wurde, setzen wir hasInteracted auf false
              setHasInteracted(false);
            });
          }
          timelineRef.current.play();
        }
      },
      onLeave: () => {
        if (audioRef.current && timelineRef.current) {
          audioRef.current.pause();
          timelineRef.current.pause();
        }
      },
      onLeaveBack: () => {
        if (audioRef.current && timelineRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          timelineRef.current.pause(0);
        }
      },
      onEnterBack: () => {
        if (audioRef.current && timelineRef.current) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log("Auto-play prevented:", error);
              setHasInteracted(false);
            });
          }
          timelineRef.current.play();
        }
      }
    });

    // Audio vorbereiten
    if (audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current.currentTime = 0;
    }

    // Cleanup
    return () => {
      if (splitRef.current) {
        splitRef.current.revert();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      timelineRef.current?.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isAudioLoaded, hasInteracted]);

  // Audio-Zeit-Update und Ende erkennen
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (timelineRef.current) {
        timelineRef.current.seek(audio.currentTime);
      }
    };

    const handleEnded = () => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onAnimationComplete]);

  return (
    <div id="audio-scene" className="audio-scene">
      <div className="text-container" ref={textContainerRef} />
      <audio 
        ref={audioRef} 
        src="/audio/elli_scene_01.mp3" 
        preload="auto"
        playsInline // Wichtig für iOS
      />
      {showPlayButton && (
        <button 
          className="play-button"
          onClick={handleManualPlay}
          aria-label="Audio abspielen"
        >
          Audio abspielen
        </button>
      )}
    </div>
  );
};

export default AudioScene; 