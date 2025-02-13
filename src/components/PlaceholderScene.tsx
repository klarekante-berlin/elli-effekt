import React, { useRef, useEffect } from 'react';
import { useSceneState } from '../context/SceneContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/PlaceholderScene.css';

gsap.registerPlugin(ScrollTrigger);

interface PlaceholderSceneProps {
  backgroundColor?: string;
  text?: string;
}

const PlaceholderScene: React.FC<PlaceholderSceneProps> = ({
  backgroundColor = '#2E8AE6',
  text = 'Placeholder Scene'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const { isActive = false } = useSceneState() ?? {};

  const timeline = useRef(gsap.timeline({ paused: true }));

  // Timeline Setup
  useEffect(() => {
    if (!containerRef.current) return;

    // Stelle sicher, dass die Timeline sauber ist
    timeline.current.clear();

    // Setze alle Wörter auf initial unsichtbar
    gsap.set(wordsRef.current, { 
      opacity: 0,
      y: 20,
      rotateX: -45
    });

    // Animiere jedes Wort nacheinander
    wordsRef.current.forEach((word, index) => {
      timeline.current.to(word, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        ease: "power3.out"
      }, index * 0.15); // Verzögerung zwischen den Wörtern
    });

    return () => {
      timeline.current.kill();
    };
  }, [text]); // Erneuere Timeline wenn sich der Text ändert

  // Animation Control basierend auf Scene-Status
  useEffect(() => {
    if (isActive) {
      timeline.current.play();
    } else {
      timeline.current.reverse();
    }
  }, [isActive]);

  // Teile den Text in einzelne Wörter
  const words = text.split(' ');

  return (
    <div 
      ref={containerRef} 
      className="placeholder-scene"
      style={{ backgroundColor }}
    >
      <div className="placeholder-text">
        {words.map((word, index) => (
          <span
            key={index}
            ref={el => {
              if (el) wordsRef.current[index] = el;
            }}
            style={{ 
              display: 'inline-block',
              marginRight: '0.3em',
              perspective: '1000px'
            }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PlaceholderScene; 