import React, { useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { withSceneControl } from '../hoc/withSceneControl';
import { ReactComponent as AvocadoIcon } from '../assets/svg/avocado.svg';
import { ReactComponent as AvocadoFilledIcon } from '../assets/svg/avocado_filled.svg';
import { ReactComponent as BathtubIcon } from '../assets/svg/bathtub.svg';
import { BaseSceneProps, SceneController } from '../hoc/withSceneControl';
import '../styles/AvocadoScene.css';

gsap.registerPlugin(ScrollTrigger);

interface AvocadoSceneProps extends BaseSceneProps {
  controller?: SceneController;
  isPlaying?: boolean;
  isActive?: boolean;
}

interface SceneRefs {
  textRef: { current: HTMLDivElement | null };
  comparisonRef: { current: HTMLDivElement | null };
  filledRef: { current: SVGSVGElement | null };
  equalsRef: { current: HTMLDivElement | null };
  resultTextRef: { current: HTMLDivElement | null };
  tub1Ref: { current: SVGSVGElement | null };
  tub2Ref: { current: SVGSVGElement | null };
  tub3Ref: { current: SVGSVGElement | null };
}

const setupSceneAnimation = (
  sceneController: SceneController | undefined,
  refs: SceneRefs
) => {
  const {
    textRef,
    comparisonRef,
    filledRef,
    equalsRef,
    resultTextRef,
    tub1Ref,
    tub2Ref,
    tub3Ref
  } = refs;

  if (!textRef.current || !comparisonRef.current) return;

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

  // Main Timeline Animation
  const mainTl = gsap.timeline({ paused: true });

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

  return {
    onEnter: () => {
      gsap.set(comparisonRef.current, { visibility: 'visible' });
      sceneController?.play();
    },
    onLeave: () => {
      sceneController?.pause();
    },
    onEnterBack: () => {
      sceneController?.play();
    },
    onLeaveBack: () => {
      sceneController?.pause();
    }
  };
};

const AvocadoScene: React.FC<AvocadoSceneProps> = ({ id, controller, isActive = false }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const filledRef = useRef<SVGSVGElement>(null);
  const equalsRef = useRef<HTMLDivElement>(null);
  const resultTextRef = useRef<HTMLDivElement>(null);
  const tub1Ref = useRef<SVGSVGElement>(null);
  const tub2Ref = useRef<SVGSVGElement>(null);
  const tub3Ref = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const avocadoRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const sceneRefs: SceneRefs = {
    textRef,
    comparisonRef,
    filledRef,
    equalsRef,
    resultTextRef,
    tub1Ref,
    tub2Ref,
    tub3Ref
  };

  const setupScene = useCallback((controller: SceneController | undefined) => {
    return setupSceneAnimation(controller, sceneRefs);
  }, [sceneRefs]);

  // Animation Setup
  useEffect(() => {
    if (!containerRef.current || !avocadoRef.current) return;

    const timeline = gsap.timeline({ paused: true });
    timelineRef.current = timeline;

    // Initial State
    gsap.set(avocadoRef.current, {
      scale: 0.8,
      opacity: 0,
      y: 50
    });

    // Animation Timeline
    timeline
      .to(avocadoRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out'
      })
      .to(avocadoRef.current, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none'
      }, 0);

    return () => {
      timeline.kill();
    };
  }, []);

  // Animation Control basierend auf isActive
  useEffect(() => {
    if (!timelineRef.current) return;

    if (isActive) {
      timelineRef.current.play();
    } else {
      timelineRef.current.pause();
    }
  }, [isActive]);

  return (
    <div ref={containerRef} className="avocado-scene">
      <div ref={avocadoRef} className="avocado">
        <svg viewBox="0 0 200 200" width="200" height="200">
          {/* Avocado Shape */}
          <path
            d="M100,20 C140,20 170,50 170,90 C170,130 140,180 100,180 C60,180 30,130 30,90 C30,50 60,20 100,20"
            fill="#2D5A27"
          />
          {/* Pit */}
          <circle cx="100" cy="90" r="30" fill="#8B4513" />
        </svg>
      </div>
    </div>
  );
};

const WrappedAvocadoScene = withSceneControl(AvocadoScene, {
  setupScene: (controller) => {
    const scene = document.querySelector<HTMLDivElement>('.scene');
    if (!scene) return;

    const refs: SceneRefs = {
      textRef: { current: scene.querySelector<HTMLDivElement>('.avocado-text') },
      comparisonRef: { current: scene.querySelector<HTMLDivElement>('.comparison-container') },
      filledRef: { current: scene.querySelector<SVGSVGElement>('.avocado-svg') },
      equalsRef: { current: scene.querySelector<HTMLDivElement>('.equals') },
      resultTextRef: { current: scene.querySelector<HTMLDivElement>('.result-text') },
      tub1Ref: { current: scene.querySelectorAll<SVGSVGElement>('.bathtub-svg')[0] },
      tub2Ref: { current: scene.querySelectorAll<SVGSVGElement>('.bathtub-svg')[1] },
      tub3Ref: { current: scene.querySelectorAll<SVGSVGElement>('.bathtub-svg')[2] }
    };

    return setupSceneAnimation(controller, refs);
  }
});

export default WrappedAvocadoScene; 