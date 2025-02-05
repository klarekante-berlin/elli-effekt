import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import transcriptData from '../transciption_data/transcript_gsap.json';
import '../styles/AudioScene.css';

interface TimedText {
  text: string;
  startTime: number;
  duration: number;
}

// Konvertiere die Segmente in unser TimedText-Format
const textSequence: TimedText[] = transcriptData.segments.map((segment) => ({
  text: segment.text,
  startTime: segment.start,
  duration: segment.end - segment.start
}));

const AudioScene: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!textContainerRef.current) return;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    timelineRef.current = gsap.timeline({ 
      paused: true,
      defaults: {
        ease: "back.out(1.7)",
        duration: 0.2
      }
    });

    // Text-Elemente erstellen und Animationen hinzufügen
    textSequence.forEach((item) => {
      const wordContainer = document.createElement('div');
      wordContainer.className = 'word-container';
      
      // Wort in einzelne Buchstaben aufteilen
      const chars = item.text.split('');
      
      chars.forEach((char, charIndex) => {
        const charElement = document.createElement('span');
        charElement.className = 'char-item';
        charElement.textContent = char;
        wordContainer.appendChild(charElement);

        // Initial-State für jeden Buchstaben
        gsap.set(charElement, {
          opacity: 0,
          scale: 0.5,
          display: 'inline-block'
        });

        // Berechne die Verzögerung für jeden Buchstaben
        const charDelay = charIndex * 0.03;

        // Einblend-Animation für jeden Buchstaben
        timelineRef.current?.to(charElement, {
          opacity: 1,
          scale: 1.2,
          duration: 0.15,
        }, item.startTime + charDelay);

        // Normalisierungs-Animation
        timelineRef.current?.to(charElement, {
          scale: 1,
          duration: 0.2,
          ease: "elastic.out(1, 0.8)"
        }, item.startTime + charDelay + 0.15);
      });

      // Füge ein Leerzeichen nach jedem Wort hinzu
      const space = document.createElement('span');
      space.className = 'char-item';
      space.textContent = ' ';
      space.style.display = 'inline-block';
      space.style.width = '0.5em';
      wordContainer.appendChild(space);

      textContainerRef.current?.appendChild(wordContainer);
    });

    setIsLoading(false);

    // Cleanup
    return () => {
      if (textContainerRef.current) {
        textContainerRef.current.innerHTML = '';
      }
      timelineRef.current?.kill();
    };
  }, []);

  const handlePlay = async () => {
    if (!audioRef.current || !timelineRef.current || isLoading) return;

    if (!isPlaying) {
      setIsPlaying(true);
      audioRef.current.currentTime = 0;
      timelineRef.current.seek(0);
      audioRef.current.play();
      timelineRef.current.play();
    } else {
      setIsPlaying(false);
      audioRef.current.pause();
      timelineRef.current.pause();
    }
  };

  // Audio-Zeit-Update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (timelineRef.current) {
        timelineRef.current.seek(audio.currentTime);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  return (
    <div className="audio-scene">
      <div className="text-container" ref={textContainerRef} />
      
      <div className="controls">
        <button 
          onClick={handlePlay} 
          className="play-button"
          disabled={isLoading}
        >
          {isLoading ? 'Laden...' : isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>

      <audio 
        ref={audioRef} 
        src="/audio/toni.mp3" 
        preload="auto"
        onEnded={() => {
          setIsPlaying(false);
          if (timelineRef.current) {
            timelineRef.current.pause(0);
          }
        }}
      />
    </div>
  );
};

export default AudioScene; 