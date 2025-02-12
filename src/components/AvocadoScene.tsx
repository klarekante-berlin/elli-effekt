import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSceneControl } from '../hoc/withSceneControl';
import { ReactComponent as AvocadoIcon } from '../assets/svg/avocado.svg';
import { ReactComponent as AvocadoFilledIcon } from '../assets/svg/avocado_filled.svg';
import { ReactComponent as BathtubIcon } from '../assets/svg/bathtub.svg';
import { useSceneStore, SceneId } from '../stores/sceneStore';
import '../styles/AvocadoScene.css';

gsap.registerPlugin(ScrollTrigger);

interface AvocadoSceneProps {
  id: Exclude<SceneId, null>;
}

const AvocadoScene: React.FC<AvocadoSceneProps> = ({ id }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const filledRef = useRef<SVGSVGElement>(null);
  const equalsRef = useRef<HTMLDivElement>(null);
  const resultTextRef = useRef<HTMLDivElement>(null);
  const tub1Ref = useRef<SVGSVGElement>(null);
  const tub2Ref = useRef<SVGSVGElement>(null);
  const tub3Ref = useRef<SVGSVGElement>(null);
  const { setCurrentScene } = useSceneStore();

  useEffect(() => {
    if (!containerRef.current || !textRef.current || !comparisonRef.current) return;

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

    // Initial Text Animation
    const ctx = gsap.context(() => {
      const textTl = gsap.timeline({
        scrollTrigger: {
          trigger: textRef.current,
          start: 'top center',
          end: 'top top',
          once: true,
        }
      });

      splitText.words?.forEach((word, index) => {
        const isWasserverbrauch = word === wasserverbrauchWord;
        textTl.fromTo(word,
          {
            opacity: 0,
            scale: isWasserverbrauch ? 1.5 : 1.2,
            y: isWasserverbrauch ? 30 : 20
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: isWasserverbrauch ? 0.8 : 0.6,
            ease: "power3.out"
          },
          index === 0 ? ">" : "-=0.4"
        );
      });

      // Main ScrollTrigger Animation
      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          fastScrollEnd: true,
          preventOverlaps: true,
          pinSpacing: true,
          onEnter: () => {
            gsap.set(comparisonRef.current, { visibility: 'visible' });
            setCurrentScene(id);
          },
          onEnterBack: () => {
            setCurrentScene(id);
          },
          onLeave: () => {
            // Setze die aktuelle Szene nur zurück, wenn wir wirklich die Szene verlassen
            if (document.documentElement.scrollTop > containerRef.current!.offsetTop) {
              setCurrentScene(null);
            }
          },
          onLeaveBack: () => {
            // Setze die aktuelle Szene nur zurück, wenn wir wirklich die Szene verlassen
            if (document.documentElement.scrollTop < containerRef.current!.offsetTop) {
              setCurrentScene(null);
            }
          }
        }
      });

      // Avocado Animation
      mainTl
        .fromTo(filledRef.current,
          { 
            opacity: 0,
            scale: 0.8
          },
          { 
            opacity: 1,
            scale: 1,
            duration: 15,
            ease: "power2.inOut"
          }
        )
        // Equals Sign
        .fromTo(equalsRef.current,
          { 
            opacity: 0,
            scale: 0.5,
            rotation: -180
          },
          { 
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 10,
            ease: "back.out(1.7)"
          }
        )
        // Bathtub Sequence
        .fromTo([tub1Ref.current, '.water-1'],
          { 
            opacity: 0,
            x: -50
          },
          { 
            opacity: 1,
            x: 0,
            duration: 10,
            stagger: 0.3,
            ease: "power2.out"
          }
        )
        .fromTo('.water-1',
          { yPercent: 100 },
          { yPercent: 0, duration: 8, ease: "power1.inOut" },
          '<+=0.5'
        )
        // Second Bathtub
        .fromTo([tub2Ref.current, '.water-2'],
          { 
            opacity: 0,
            x: -50
          },
          { 
            opacity: 1,
            x: 0,
            duration: 10,
            stagger: 0.3,
            ease: "power2.out"
          }
        )
        .fromTo('.water-2',
          { yPercent: 100 },
          { yPercent: 0, duration: 8, ease: "power1.inOut" },
          '<+=0.5'
        )
        // Third Bathtub
        .fromTo([tub3Ref.current, '.water-3'],
          { 
            opacity: 0,
            x: -50
          },
          { 
            opacity: 1,
            x: 0,
            duration: 10,
            stagger: 0.3,
            ease: "power2.out"
          }
        )
        .fromTo('.water-3',
          { yPercent: 100 },
          { yPercent: 0, duration: 8, ease: "power1.inOut" },
          '<+=0.5'
        )
        // Result Text
        .fromTo(resultTextRef.current,
          { 
            opacity: 0,
            y: 30,
            scale: 0.9
          },
          { 
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 15,
            ease: "power2.out"
          }
        );
    }, containerRef);

    return () => {
      ctx.revert();
      splitText.revert();
      setCurrentScene(null);
    };
  }, [id, setCurrentScene]);

  return (
    <div ref={containerRef} className="avocado-scene" id={id}>
      <div ref={textRef} className="avocado-text">
        Der Wasserverbrauch im Anbau für eine einzige Avocado beträgt...
      </div>
      <div ref={comparisonRef} className="comparison-container">
        <div className="avocado-container">
          <div className="avocado-parts">
            <AvocadoFilledIcon ref={filledRef} className="avocado-svg" />
            <AvocadoIcon className="avocado-svg avocado-outline" />
          </div>
        </div>
        <div ref={equalsRef} className="equals">=</div>
        <div className="bathtubs-container">
          <div className="bathtub-wrapper">
            <BathtubIcon ref={tub1Ref} className="bathtub-svg" />
            <div className="water water-1" />
          </div>
          <div className="bathtub-wrapper">
            <BathtubIcon ref={tub2Ref} className="bathtub-svg" />
            <div className="water water-2" />
          </div>
          <div className="bathtub-wrapper">
            <BathtubIcon ref={tub3Ref} className="bathtub-svg" />
            <div className="water water-3" />
          </div>
        </div>
      </div>
      <div ref={resultTextRef} className="result-text">
        <div className="highlight-box">3 volle Badewannen</div>
        <div className="sub-text">oder etwa 500 Liter Wasser also 9x Duschen</div>
      </div>
    </div>
  );
};

export default withSceneControl(AvocadoScene, {
  handleScroll: false,
  handleTouch: false,
  snapIntoPlace: false
}); 