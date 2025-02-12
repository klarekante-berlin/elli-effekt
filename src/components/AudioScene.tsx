import React, { useEffect, useRef, useState } from 'react';
import { useScene } from '../context/SceneContext';
import gsap from 'gsap';
import SplitType from 'split-type';
import transcriptData from '../transciption_data/transcript_elli_scene_01.json';
import '../styles/AudioScene.css';

interface AudioSceneProps {
  audioSource?: string;
}

const AudioScene: React.FC<AudioSceneProps> = ({
  audioSource = '/audio/elli_scene_01.mp3'
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const timeline = useRef(gsap.timeline({ paused: true }));
  const splitText = useRef<SplitType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const { isActive } = useScene();

  // Audio laden und initialisieren
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    audio.load();
    audio.addEventListener('canplay', () => setIsLoaded(true));
    
    return () => {
      audio.removeEventListener('canplay', () => setIsLoaded(true));
    };
  }, []);

  // Text Animation Setup
  useEffect(() => {
    if (!textRef.current || !isLoaded) return;

    // Text vorbereiten
    textRef.current.innerHTML = 
      '<div class="text">Hey, ich bin Elli. Vor genau 89 Tagen habe ich alles Vertraute gegen Berlin eingetauscht. Naja, fast alles. Mein Morgenritual zum Beispiel habe ich einfach mitgenommen.</div>';

    // Cleanup vorheriger Split
    if (splitText.current) splitText.current.revert();

    // Neuen Split erstellen
    splitText.current = new SplitType('.text', {
      types: 'words,chars',
      tagName: 'span'
    });

    // Timeline zurücksetzen
    timeline.current.clear();

    // Initial states
    gsap.set(splitText.current.chars, { 
      opacity: 0,
      scale: 0.3,
      filter: 'blur(10px)',
      display: 'inline-block',
      transformOrigin: 'center center'
    });

    // Text Segmente animieren
    splitText.current.words?.forEach((word, wordIndex) => {
      const segment = transcriptData.segments.find((seg, i) => {
        const words = transcriptData.segments.slice(0, i + 1)
          .reduce((acc, s) => acc + s.text.split(' ').length, 0);
        return wordIndex < words;
      });

      if (!segment) return;

      const segmentIndex = transcriptData.segments.indexOf(segment);
      const wordsBeforeSegment = transcriptData.segments
        .slice(0, segmentIndex)
        .reduce((acc, s) => acc + s.text.split(' ').length, 0);
      
      const startTime = segment.start + ((wordIndex - wordsBeforeSegment) * 0.15);

      // Buchstaben animieren
      word.querySelectorAll('.char').forEach((char, charIndex) => {
        const charStartTime = startTime + (charIndex * 0.04);

        timeline.current
          .to(char, {
            opacity: 1,
            scale: 1.4,
            filter: 'blur(0px)',
            duration: 0.5,
            ease: "back.out(1.7)",
          }, charStartTime)
          .to(char, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          }, charStartTime + 0.3);
      });

      // Wort-Highlight
      timeline.current
        .to(word, {
          color: '#ffffff',
          textShadow: '0 0 20px rgba(255,255,255,0.6)',
          duration: 0.4,
          ease: "power2.inOut"
        }, startTime + 0.2)
        .to(word, {
          color: '#ffffff',
          textShadow: '0 0 15px rgba(255,255,255,0.3)',
          duration: 0.4,
          ease: "power2.inOut"
        }, startTime + 0.7);
    });

    return () => {
      if (splitText.current) splitText.current.revert();
      timeline.current.kill();
    };
  }, [isLoaded]);

  // Audio und Animation Control
  useEffect(() => {
    if (!audioRef.current || !isLoaded) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      timeline.current.seek(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);

    if (isActive) {
      audio.play().catch(error => {
        console.warn('Audio autoplay failed:', error);
      });
      timeline.current.play();
    } else {
      audio.pause();
      timeline.current.pause();
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.pause();
    };
  }, [isActive, isLoaded]);

  return (
    <div className={`audio-scene ${isActive ? 'active' : ''}`}>
      <div ref={textRef} className="text-container" />
      <div className="audio-container">
        <audio
          ref={audioRef}
          src={audioSource}
          preload="auto"
        />
        
        <div className="audio-controls">
          <button
            onClick={() => audioRef.current?.paused ? audioRef.current?.play() : audioRef.current?.pause()}
            className={`control-button ${!audioRef.current?.paused ? 'playing' : ''}`}
            aria-label={!audioRef.current?.paused ? 'Pause' : 'Play'}
          >
            {!audioRef.current?.paused ? (
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

export default AudioScene; 