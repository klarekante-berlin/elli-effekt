import React, { useEffect, useRef, createElement, CSSProperties } from 'react';
import SplitType from 'split-type';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type ValidHTMLTags = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';

interface AnimatedTextProps {
  text: string;
  tag?: ValidHTMLTags;
  className?: string;
  style?: CSSProperties;
  animation?: 'fadeUp' | 'fadeIn' | 'chars' | 'words';
  stagger?: number;
  duration?: number;
  delay?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  tag = 'h1',
  className = '',
  style,
  animation = 'chars',
  stagger = 0.05,
  duration = 0.8,
  delay = 0
}) => {
  const textRef = useRef<HTMLElement>(null);
  const splitRef = useRef<SplitType | null>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // Text aufteilen
    splitRef.current = new SplitType(textRef.current, {
      types: ['chars', 'words', 'lines'],
      tagName: 'span'
    });

    // Animation basierend auf dem gewählten Typ
    const elements = animation === 'chars' 
      ? splitRef.current.chars
      : animation === 'words' 
        ? splitRef.current.words
        : [textRef.current];

    // Standard-Animation zurücksetzen
    gsap.set(elements, { 
      opacity: 0,
      y: animation.includes('Up') ? 20 : 0 
    });

    // ScrollTrigger Animation
    gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration: duration,
      stagger: stagger,
      delay: delay,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: textRef.current,
        start: 'top bottom-=100',
        end: 'bottom top+=100',
        toggleActions: 'play none none reverse'
      }
    });

    // Cleanup
    return () => {
      splitRef.current?.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [text, animation, stagger, duration, delay]);

  return createElement(tag, {
    ref: textRef,
    className: className,
    style: style,
    children: text
  });
};

export default AnimatedText; 