import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSceneControl } from '../hoc/withSceneControl';
import { ReactComponent as AvocadoIcon } from '../assets/svg/avocado.svg';
import { ReactComponent as AvocadoFilledIcon } from '../assets/svg/avocado_filled.svg';
import '../styles/AvocadoScene.css';

gsap.registerPlugin(ScrollTrigger);

interface AvocadoSceneProps {
  id: string;
}

const AvocadoScene: React.FC<AvocadoSceneProps> = ({ id }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<SVGSVGElement>(null);
  const filledRef = useRef<SVGSVGElement>(null);
  const waveRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !textRef.current || !outlineRef.current || !filledRef.current) return;

    // Text splitten in Wörter und Buchstaben
    const splitText = new SplitType(textRef.current, {
      types: 'words,chars',
      tagName: 'span'
    });

    // Spezielle Formatierung für "Wasserverbrauch"
    const wasserverbrauchWord = splitText.words?.find(word => 
      word.textContent?.toLowerCase().includes('wasserverbrauch')
    );

    const wasserverbrauchChars = splitText.chars?.filter(char => 
      char.parentElement === wasserverbrauchWord
    );

    wasserverbrauchChars?.forEach(char => {
      char.classList.add('highlight');
    });

    // GSAP Timeline für die Animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top center',
        end: 'bottom center',
        toggleActions: 'play none none reverse',
        markers: false
      }
    });

    // Text Animation
    splitText.words?.forEach((word, index) => {
      const isWasserverbrauch = word === wasserverbrauchWord;
      
      tl.fromTo(word,
        {
          opacity: 0,
          scale: isWasserverbrauch ? 1.5 : 1.2,
          y: isWasserverbrauch ? 30 : 20,
          filter: `blur(${isWasserverbrauch ? 15 : 10}px)`,
          rotationX: -45
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: 'blur(0px)',
          rotationX: 0,
          duration: isWasserverbrauch ? 0.8 : 0.6,
          ease: "power3.out"
        },
        index === 0 ? ">" : "-=0.4"
      );
    });

    // SVG Animations
    gsap.set([outlineRef.current, filledRef.current], {
      opacity: 1,
      scale: 0.95
    });

    gsap.set('.avocado-flesh', {
      yPercent: 100
    });

    gsap.set('.wave-container', {
      yPercent: 100,
      opacity: 1
    });

    const waveTl = gsap.timeline();
    
    // Endlose Wellenanimation
    waveTl.to('.wave1', {
      x: -300,
      duration: 2,
      repeat: -1,
      ease: 'none'
    }, 0)
    .to('.wave2', {
      x: 300,
      duration: 2.5,
      repeat: -1,
      ease: 'none'
    }, 0);

    tl.to([outlineRef.current, filledRef.current], {
      scale: 1,
      duration: 0.8,
      ease: 'power2.out'
    })
    .to('.avocado-flesh', {
      yPercent: 0,
      duration: 3,
      ease: 'power1.inOut'
    }, '-=0.4')
    .to('.wave-container', {
      yPercent: 0,
      duration: 3,
      ease: 'none'
    }, '<')
    .to('.wave-container', {
      opacity: 0,
      duration: 0.3
    });

    return () => {
      tl.kill();
      waveTl.kill();
      splitText.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="avocado-scene" id={id}>
      <div ref={textRef} className="avocado-text">
        Der Wasserverbrauch im Anbau für eine einzige Avocado beträgt...
      </div>
      <div className="avocado-container">
        <div className="wave-container">
          <svg viewBox="0 0 500 150" preserveAspectRatio="none">
            <path className="wave wave1" d="M-100,20 
              C-50,5 0,35 50,20 
              C100,5 150,35 200,20 
              C250,5 300,35 350,20 
              C400,5 450,35 500,20 
              L500,150 L-100,150 Z" 
              fill="white" />
            <path className="wave wave2" d="M-100,30 
              C-50,45 0,15 50,30 
              C100,45 150,15 200,30 
              C250,45 300,15 350,30 
              C400,45 450,15 500,30 
              L500,150 L-100,150 Z" 
              fill="white" />
          </svg>
        </div>
        <div className="avocado-parts">
          <div className="avocado-flesh">
            <AvocadoFilledIcon ref={filledRef} className="avocado-svg" />
          </div>
          <AvocadoIcon ref={outlineRef} className="avocado-svg avocado-outline" />
        </div>
      </div>
    </div>
  );
};

export default withSceneControl(AvocadoScene); 