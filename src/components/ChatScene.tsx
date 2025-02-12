import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useScene } from '../context/SceneContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import messageSound1 from '../assets/audio_effects/message_01.wav';
import messageSound2 from '../assets/audio_effects/message_02.wav';
import '../styles/ChatScene.css';

interface Comment {
  text: string;
  name: string;
  timestamp: string;
  isRight?: boolean;
}

const comments: Comment[] = [
  { text: 'Klimasünderin!!!', name: 'EcoWarrior92', timestamp: '14:22', isRight: false },
  { text: 'Statt einen positiven impact zu haben, animierst du andere unserer Umwelt zu schaden schäm dich!', name: 'GreenLife', timestamp: '14:22', isRight: true },
  { text: 'Denkst du wirklich, es ist nachhaltig, eine Frucht zu feiern, die tausende Kilometer fliegt', name: 'PlanetProtector', timestamp: '14:23', isRight: false },
  { text: 'Wälder werden gerodet, Wasserquellen versiegen, und das alles für deinen grünen Toast?', name: 'EarthFirst', timestamp: '14:23', isRight: true },
  { text: 'Mach dir mal Gedanken, ob dein Frühstück wirklich so nen Fußabdruck hinterlassen muss - peinlich!', name: 'SustainableSarah', timestamp: '14:24', isRight: false },
  { text: 'Dörfer trocknen aus nur, damit du dein Insta mit einem "healthy Avocado Toast" aufpeppen kannst', name: 'ClimateChampion', timestamp: '14:24', isRight: true },
  { text: 'Hoffentlich bleibt dir das Essen im Hals stecken.', name: 'VeganVigilante', timestamp: '14:25', isRight: false },
  { text: 'Pushst den Avocado-Hype. Wasserverbrauch? CO2? Schon mal gehört? 😳 richtig nachhaltig! 🤦‍♀️', name: 'WaterGuardian', timestamp: '14:25', isRight: true },
  { text: 'Avocados? Klar, schmecken gut, aber hast du mal an den Wasserverbrauch gedacht??', name: 'EcoEnforcer', timestamp: '14:26', isRight: false },
  { text: 'Nichts wie eine gute Avocado … die dafür sorgt, dass ganze Ökosysteme zerstört werden. Lecker! 🙃🌱', name: 'BiodiversityBoss', timestamp: '14:26', isRight: true },
  { text: 'Fühlst du dich jetzt krass mit deinem fancy Lachs und deiner wasserverschwendenden Avocado', name: 'OceanDefender', timestamp: '14:27', isRight: false },
  { text: 'Sich umweltbewusst nennen und dann Lachs essen… passt eher zu einer doppelmoralischen Speisekarte', name: 'MarineProtector', timestamp: '14:27', isRight: true },
  { text: 'Du bist echt bereit, die Meere zu plündern, nur für ein Insta-Bild mit Lachs? Traurig. 👀🌍', name: 'SeaShepherd', timestamp: '14:28', isRight: false },
  { text: 'Nichts wie Lachs zum Brunch… und Überfischung für die Meere. Na, guten Appetit!', name: 'FishFighter', timestamp: '14:28', isRight: true },
  { text: 'Zum kotzen!!', name: 'EcoRage', timestamp: '14:29', isRight: false }
];

const ChatScene: React.FC = () => {
  const commentsRef = useRef<HTMLDivElement>(null);
  const replayButtonRef = useRef<HTMLButtonElement>(null);
  const currentIndexRef = useRef(0);
  const timeline = useRef(gsap.timeline({ paused: true }));
  const audioRef1 = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);
  const [visibleComments, setVisibleComments] = useState<Comment[]>([]);
  const { isActive } = useScene();
  const visibleMessagesCount = 6;

  // Audio Setup
  useGSAP(() => {
    audioRef1.current = new Audio(messageSound1);
    audioRef2.current = new Audio(messageSound2);
    
    if (audioRef1.current) audioRef1.current.volume = 0.4;
    if (audioRef2.current) audioRef2.current.volume = 0.4;

    audioRef1.current?.load();
    audioRef2.current?.load();

    return () => {
      [audioRef1, audioRef2].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.src = '';
          ref.current = null;
        }
      });
    };
  });

  const playMessageSound = useCallback((index: number) => {
    const audio = index % 2 === 0 ? audioRef1.current : audioRef2.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(error => console.warn('Audio playback failed:', error));
    }
  }, []);

  // Animation Funktionen
  const animateMessageOut = useCallback((element: HTMLElement) => {
    return gsap.to(element, {
      opacity: 0,
      y: -100,
      scale: 0.8,
      z: -100,
      rotateX: -45,
      transformOrigin: "50% 50% -100",
      duration: 0.8,
      ease: "power3.inOut"
    });
  }, []);

  const animateMessagesUp = useCallback((elements: HTMLElement[]) => {
    if (!elements.length || !commentsRef.current) return gsap.timeline();

    const messageHeight = elements[0]?.offsetHeight || 80;
    const tl = gsap.timeline();

    gsap.set(commentsRef.current, {
      height: `${messageHeight * visibleMessagesCount}px`,
      overflow: 'hidden'
    });

    elements.forEach((el, i) => {
      tl.to(el, {
        y: `-=${messageHeight}`,
        duration: 0.5,
        ease: "power2.inOut",
        scale: 0.98,
      }, i * 0.08)
      .to(el, {
        scale: 1,
        duration: 0.3,
        ease: "power1.out"
      }, '>-0.1');
    });

    return tl;
  }, []);

  const animateMessageIn = useCallback((element: HTMLElement) => {
    return gsap.fromTo(element,
      { 
        opacity: 0,
        y: 80,
        scale: 0.8,
        z: -100
      },
      { 
        opacity: 1,
        y: 0,
        scale: 1,
        z: 0,
        duration: 0.8,
        ease: 'back.out(1.2)'
      }
    );
  }, []);

  const animateNextMessage = useCallback(() => {
    if (!commentsRef.current || currentIndexRef.current >= comments.length) return;

    const currentIndex = currentIndexRef.current;
    playMessageSound(currentIndex);
    
    if (currentIndex < visibleMessagesCount) {
      setVisibleComments(prev => [...prev, comments[currentIndex]]);
      requestAnimationFrame(() => {
        const messageElements = Array.from(commentsRef.current?.children || []);
        const currentElement = messageElements[currentIndex] as HTMLElement;
        if (currentElement) {
          animateMessageIn(currentElement);
        }
      });
      return;
    }

    const newComment = comments[currentIndex];
    const messageElements = Array.from(commentsRef.current?.children || []) as HTMLElement[];
    
    if (messageElements.length === 0) return;

    const tl = gsap.timeline();

    if (messageElements[0]) {
      tl.add(animateMessageOut(messageElements[0]));
    }

    tl.addLabel('exitComplete', '+=0.4');

    tl.call(() => {
      setVisibleComments(prev => [...prev.slice(1), newComment]);
      
      requestAnimationFrame(() => {
        const remainingMessages = Array.from(commentsRef.current?.children || [])
          .slice(0, -1)
          .map(el => el as HTMLElement);
        
        if (remainingMessages.length > 0) {
          tl.add(animateMessagesUp(remainingMessages), '+=0.1');
        }

        const newElement = commentsRef.current?.children[visibleMessagesCount - 1] as HTMLElement;
        if (newElement) {
          gsap.set(newElement, { 
            opacity: 0,
            y: 80,
            scale: 0.8,
            z: -100
          });
          
          tl.add(animateMessageIn(newElement), '+=0.3');
        }
      });
    }, [], 'exitComplete');
  }, [playMessageSound, animateMessageIn, animateMessageOut, animateMessagesUp]);

  // Animation Control
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && currentIndexRef.current < comments.length) {
      interval = setInterval(() => {
        if (currentIndexRef.current < comments.length) {
          animateNextMessage();
          currentIndexRef.current++;
        } else {
          clearInterval(interval);
          gsap.to(replayButtonRef.current, {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out'
          });
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [isActive, animateNextMessage]);

  const handleReplay = useCallback(() => {
    if (!commentsRef.current) return;
    
    gsap.to(replayButtonRef.current, {
      opacity: 0,
      duration: 0.3
    });

    setVisibleComments([]);
    currentIndexRef.current = 0;
    
    gsap.delayedCall(0.1, () => {
      animateNextMessage();
      currentIndexRef.current = 1;
    });
  }, [animateNextMessage]);

  return (
    <div className="chat-scene">
      <div 
        ref={commentsRef} 
        className="chat-messages"
        style={{
          position: 'relative',
          height: '480px',
          overflow: 'hidden'
        }}
      >
        {visibleComments.map((comment, index) => (
          <div 
            key={`${comment.name}-${index}`}
            className={`comment ${comment.isRight ? 'right' : 'left'}`}
            style={{ position: 'relative' }}
          >
            <div className="avatar-container">
              <div className="avatar" />
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="name">{comment.name}</span>
                <span className="timestamp">{comment.timestamp}</span>
              </div>
              <p className="message-text">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        ref={replayButtonRef}
        className="replay-button"
        onClick={handleReplay}
        style={{ opacity: 0 }}
      >
        Wiederholen
      </button>
    </div>
  );
};

export default ChatScene; 