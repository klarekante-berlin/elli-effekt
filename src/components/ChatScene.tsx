import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/ChatScene.css';
import AnimatedText from './AnimatedText';

gsap.registerPlugin(ScrollTrigger);

interface Comment {
  text: string;
  delay: number;
}

const comments: Comment[] = [
  { text: 'Klimasünderin!!!', delay: 0 },
  { text: 'Statt einen positiven impact zu haben, animierst du andere unserer Umwelt zu schaden schäm dich!', delay: 0.2 },
  { text: 'Denkst du wirklich, es ist nachhaltig, eine Frucht zu feiern, die tausende Kilometer fliegt', delay: 0.3 },
  { text: 'Wälder werden gerodet, Wasserquellen versiegen, und das alles für deinen grünen Toast?', delay: 0.4 },
  { text: 'Mach dir mal Gedanken, ob dein Frühstück wirklich so nen Fußabdruck hinterlassen muss - peinlich!', delay: 0.5 },
  { text: 'Dörfer trocknen aus nur, damit du dein Insta mit einem "healthy Avocado Toast" aufpeppen kannst', delay: 0.6 },
  { text: 'Hoffentlich bleibt dir das Essen im Hals stecken.', delay: 0.7 },
  { text: 'Pushst den Avocado-Hype. Wasserverbrauch? CO2? Schon mal gehört? 😳 richtig nachhaltig! 🤦‍♀️', delay: 0.8 },
  { text: 'Avocados? Klar, schmecken gut, aber hast du mal an den Wasserverbrauch gedacht??', delay: 0.9 },
  { text: 'Nichts wie eine gute Avocado … die dafür sorgt, dass ganze Ökosysteme zerstört werden. Lecker! 🙃🌱', delay: 1.0 },
  { text: 'Fühlst du dich jetzt krass mit deinem fancy Lachs und deiner wasserverschwendenden Avocado', delay: 1.1 },
  { text: 'Sich umweltbewusst nennen und dann Lachs essen… passt eher zu einer doppelmoralischen Speisekarte', delay: 1.2 },
  { text: 'Du bist echt bereit, die Meere zu plündern, nur für ein Insta-Bild mit Lachs? Traurig. 👀🌍', delay: 1.3 },
  { text: 'Nichts wie Lachs zum Brunch… und Überfischung für die Meere. Na, guten Appetit!', delay: 1.4 },
  { text: 'Zum kotzen!!', delay: 1.5 }
];

const ChatScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !commentsRef.current) return;

    const commentElements = commentsRef.current.children;
    
    // Initial states
    gsap.set(commentElements, { 
      opacity: 0,
      x: -50,
      filter: 'blur(10px)'
    });

    // ScrollTrigger für die gesamte Szene
    const sceneTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        gsap.to(commentElements, {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out'
        });
      },
      onLeave: () => {
        gsap.to(commentElements, {
          opacity: 0,
          x: -50,
          filter: 'blur(10px)',
          duration: 0.5
        });
      },
      onEnterBack: () => {
        gsap.to(commentElements, {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out'
        });
      },
      onLeaveBack: () => {
        gsap.to(commentElements, {
          opacity: 0,
          x: -50,
          filter: 'blur(10px)',
          duration: 0.5
        });
      }
    });

    return () => {
      sceneTrigger.kill();
    };
  }, []);

  return (
    <div id="chat-scene" className="chat-scene" ref={containerRef}>
      <div className="comments-container" ref={commentsRef}>
        {comments.map((comment, index) => (
          <div key={index} className="comment">
            <AnimatedText
              text={comment.text}
              tag="p"
              animation="fadeIn"
              stagger={0.02}
              delay={comment.delay}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatScene; 