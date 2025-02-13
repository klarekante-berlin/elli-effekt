import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useSceneState } from '../context/SceneContext';
import SplitType from 'split-type';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactComponent as AvocadoIcon } from '../assets/svg/avocado.svg';
import { ReactComponent as AvocadoFilledIcon } from '../assets/svg/avocado_filled.svg';
import { ReactComponent as BathtubIcon } from '../assets/svg/bathtub.svg';
import '../styles/AvocadoScene.css';
gsap.registerPlugin(ScrollTrigger);

interface AvocadoSceneProps {
  onStart: () => void;
}

const AvocadoScene: React.FC<AvocadoSceneProps> = ({ onStart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const avocadoRef = useRef<SVGSVGElement>(null);
  const filledRef = useRef<SVGSVGElement>(null);
  const equalsRef = useRef<HTMLDivElement>(null);
  const tub1Ref = useRef<SVGSVGElement>(null);
  const tub2Ref = useRef<SVGSVGElement>(null);
  const tub3Ref = useRef<SVGSVGElement>(null);
  const comparisonTextRef = useRef<HTMLDivElement>(null);
  const waterTextRef = useRef<HTMLDivElement>(null);
  const fill1Ref = useRef<SVGGElement>(null);
  const fill2Ref = useRef<SVGGElement>(null);
  const fill3Ref = useRef<SVGGElement>(null);
  

  const { isActive = false } = useSceneState() ?? {};

  useGSAP(() => {
    if (!textRef.current || !avocadoRef.current || !filledRef.current || 
        !equalsRef.current || !tub1Ref.current || !tub2Ref.current || 
        !tub3Ref.current || !fill1Ref.current || !fill2Ref.current || 
        !fill3Ref.current || !comparisonTextRef.current || !waterTextRef.current) {
      return;
    }

    // Text Animation Setup
    const splitText = new SplitType(textRef.current, {
      types: 'words,chars',
      tagName: 'span'
    });

    // Highlight "Wasserverbrauch"
    const wasserverbrauchWord = splitText.words?.find(word => 
      word.textContent?.toLowerCase().includes('wasserverbrauch')
    );
    const wasserverbrauchChars = splitText.chars?.filter(char => 
      char.parentElement === wasserverbrauchWord
    );
    wasserverbrauchChars?.forEach(char => {
      char.classList.add('highlight');
    });

    // Erste Sequenz: Text, dann Avocado Outline, dann Gleichheitszeichen
    const sequence1 = gsap.timeline({
      paused: true
    }).addLabel('start')
      // Text Animation
      .fromTo(splitText.words,
        {
          opacity: 0,
          scale: word => word === wasserverbrauchWord ? 1.5 : 1.2,
          y: word => word === wasserverbrauchWord ? 30 : 20
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out"
        }
      )
      // Warte bis Text-Animation fertig ist
      .addLabel('textDone', '+=0.3')
      // Dann Avocado Outline
      .fromTo(avocadoRef.current,
        { 
          opacity: 0,
          scale: 0.8,
          y: 20
        },
        { 
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out"
        },
        'textDone'
      )
      // Warte bis Avocado fertig ist
      .addLabel('avocadoDone', '+=0.2')
      // Dann Gleichheitszeichen
      .fromTo(equalsRef.current,
        { 
          opacity: 0,
          scale: 0.5
        },
        { 
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power3.out"
        },
        'avocadoDone'
      )
      .addLabel('end');

    // Zweite Sequenz: Badewannen erscheinen, dann Avocado füllen
    const sequence2 = gsap.timeline({
      paused: true
    }).addLabel('start')
      // Dann alle Badewannen
      .fromTo([tub1Ref.current, tub2Ref.current, tub3Ref.current],
        { 
          opacity: 0,
          y: 20
        },
        { 
          opacity: 1,
          y: 0,
          stagger: 0.4,
          duration: 1.4,
          ease: "power3.out"
        }
      )
      // Warte bis alle Badewannen sichtbar sind
      .addLabel('tubsDone', '+=0.3')
      // Dann Avocado füllen
      .fromTo(filledRef.current,
        {
          opacity: 0,
          scale: 0.95
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.inOut"
        },
        'tubsDone'
      )
      // Dann erste Badewanne füllen
      .fromTo(fill1Ref.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.inOut"
        },
        '>-0.4'
      )
      .addLabel('end');

    // Dritte Sequenz: Restliche Badewannen füllen, dann Text
    const sequence3 = gsap.timeline({
      paused: true
    }).addLabel('start')
      // Erst die beiden restlichen Badewannen füllen
      .fromTo([fill2Ref.current, fill3Ref.current],
        {
          opacity: 0,
        },
        {
          opacity: 1,
          stagger: 0.4,
          duration: 1,
          ease: "power2.inOut"
        }
      )
      // Warte bis Füllungen fertig sind
      .addLabel('fillsDone', '+=0.2')
      // Dann Text einblenden
      .fromTo([comparisonTextRef.current, waterTextRef.current],
        { 
          opacity: 0,
          y: 20
        },
        { 
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 0.6,
          ease: "power3.out"
        },
        'fillsDone'
      )
      .addLabel('end');

    // ScrollTrigger für erste Sequenz
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top+=300 center",
      end: 'bottom',
      onEnter: () => sequence1.play(),
      onLeave: () => sequence1.reverse(),
      onEnterBack: () => sequence1.play(),
      onLeaveBack: () => sequence1.reverse(),
      markers: true
    });

    // ScrollTrigger für zweite Sequenz
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top+=700 center",
      end: 'bottom',
      onEnter: () => sequence2.play(),
      onLeave: () => sequence2.reverse(),
      onEnterBack: () => sequence2.play(),
      onLeaveBack: () => sequence2.reverse(),
      markers: true
    });

    // ScrollTrigger für dritte Sequenz
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top+=1000 center",
      end: 'bottom',
      onEnter: () => sequence3.play(),
      onLeave: () => sequence3.reverse(),
      onEnterBack: () => sequence3.play(),
      onLeaveBack: () => sequence3.reverse(),
      markers: true
    });

    return () => {
      sequence1.kill();
      sequence2.kill();
      sequence3.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isActive]);

  useEffect(() => {
    if (tub1Ref.current) fill1Ref.current = tub1Ref.current.querySelector('.fill');
    if (tub2Ref.current) fill2Ref.current = tub2Ref.current.querySelector('.fill');
    if (tub3Ref.current) fill3Ref.current = tub3Ref.current.querySelector('.fill');
  }, []);

  return (
    <div ref={containerRef} className="scene avocado-scene">
      <div className="scene-content">
        <div ref={textRef} className="avocado-text">
          Der Wasserverbrauch einer Avocado entspricht drei vollen Badewannen
        </div>
        <div className="comparison-container">
          <div className="avocado-container">
            <AvocadoIcon className="avocado-svg avocado-outline" ref={avocadoRef}/>
            <AvocadoFilledIcon className="avocado-svg avocado-filled" ref={filledRef} />
          </div>
          <div ref={equalsRef} className="equals">=</div>
          <div className="bathtubs-container">
            <div className="bathtub-wrapper">
              <BathtubIcon 
                className="bathtub-svg" 
                ref={tub1Ref} 
              />
            </div>
            <div className="bathtub-wrapper">
              <BathtubIcon 
                className="bathtub-svg" 
                ref={tub2Ref}
              />
            </div>
            <div className="bathtub-wrapper">
              <BathtubIcon 
                className="bathtub-svg" 
                ref={tub3Ref}
              />
            </div>
          </div>
        </div>
        <div className="result-container">
          <div ref={comparisonTextRef} className="comparison-text">
            3 volle Badewannen
          </div>
          <div ref={waterTextRef} className="water-text">
            oder etwa 500 Liter Wasser also 9x Duschen
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvocadoScene; 