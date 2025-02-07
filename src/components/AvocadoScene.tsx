import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSceneControl } from '../hoc/withSceneControl';
import avocadoSvg from '../assets/svg/avocado_filled.svg';
import '../styles/AvocadoScene.css';

gsap.registerPlugin(ScrollTrigger);

interface AvocadoSceneProps {
  id: string;
}

const AvocadoScene: React.FC<AvocadoSceneProps> = ({ id }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!containerRef.current || !textRef.current || !svgRef.current) return;

    // Text splitten
    const splitText = new SplitType(textRef.current, {
      types: 'chars',
      tagName: 'span'
    });

    // Spezielle Formatierung für "Wasserverbrauch"
    const wasserverbrauchChars = splitText.chars?.filter(char => 
      char.parentElement?.textContent?.toLowerCase().includes('wasserverbrauch')
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
        toggleActions: 'play none none reverse'
      }
    });

    // Animation der einzelnen Buchstaben
    tl.fromTo(splitText.chars, 
      {
        opacity: 0,
        scale: 1.5,
        filter: 'blur(10px)',
      },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.2,
        stagger: {
          each: 0.03,
          from: "start"
        },
        ease: "back.out(1.7)"
      }
    )
    // Nachdem alle Buchstaben da sind, SVG einblenden
    .from(svgRef.current, {
      opacity: 0,
      y: 30,
      filter: 'blur(10px)',
      duration: 1,
      ease: 'power2.out'
    });

    // Cleanup
    return () => {
      tl.kill();
      splitText.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="avocado-scene" id={id}>
      <div ref={textRef} className="avocado-text">
        Der Wasserverbrauch im Anbau für eine einzige Avocado beträgt...
      </div>
      <img 
        ref={svgRef} 
        src={avocadoSvg} 
        alt="Avocado Illustration" 
        className="avocado-svg" 
      />
    </div>
  );
};

export default withSceneControl(AvocadoScene); 