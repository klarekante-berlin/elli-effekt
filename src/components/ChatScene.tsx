import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useScene } from '../context/SceneContext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import messageSound1 from '../assets/audio_effects/message_01.wav';
import messageSound2 from '../assets/audio_effects/message_02.wav';
import '../styles/ChatScene.css';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

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

  const animateMessageTransitions = useCallback((newComment: Comment) => {
    if (!commentsRef.current) return;

    const messageHeight = commentsRef.current.children[0]?.clientHeight || 80;
    const timeline = gsap.timeline();

    // Update state with new message
    setVisibleComments(prev => {
      if (prev.length >= visibleMessagesCount) {
        return [...prev, newComment];
      }
      return [...prev, newComment];
    });

    requestAnimationFrame(() => {
      if (!commentsRef.current) return;
      
      const messages = Array.from(commentsRef.current.children) as HTMLElement[];
      const newMessageElement = messages[messages.length - 1];

      if (messages.length <= visibleMessagesCount) {
        // Initial messages animation (first 6)
        gsap.fromTo(newMessageElement,
          {
            opacity: 0,
            y: 50,
            scale: 0.9,
            transformOrigin: 'center bottom'
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            clearProps: 'all'
          }
        );
      } else {
        const tl = gsap.timeline({
          defaults: { ease: 'power3.inOut' }
        });

        // 1. Fade out top message
        tl.to(messages[0], {
          opacity: 0,
          y: -messageHeight/2,
          scale: 0.9,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            setVisibleComments(prev => prev.slice(1));
          }
        });

        // 2. Move remaining messages up with stagger
        const messagesToShift = messages.slice(1, -1);
        messagesToShift.forEach((msg, index) => {
          tl.to(msg, {
            y: `-=${messageHeight + 12}`,
            duration: 0.7,
            ease: 'power3.inOut',
            delay: index * 0.1,
          }, '-=0.5');
        });

        // 3. Animate in new message
        tl.fromTo(newMessageElement,
          {
            opacity: 0,
            y: 40,
            scale: 0.9,
            transformOrigin: 'center bottom'
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.2)',
            clearProps: 'all'
          },
          '-=0.3'
        );

        // Play sound with slight delay
        tl.call(() => playMessageSound(currentIndexRef.current), [], '-=0.4');
      }
    });
  }, [playMessageSound, visibleMessagesCount]);

  // Replace existing animateNextMessage with new version
  const animateNextMessage = useCallback(() => {
    if (currentIndexRef.current >= comments.length) return;
    
    const newComment = comments[currentIndexRef.current];
    animateMessageTransitions(newComment);
  }, [animateMessageTransitions]);

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

  // Update handleReplay to use Flip
  const handleReplay = useCallback(() => {
    if (!commentsRef.current) return;
    
    // Fade out replay button
    gsap.to(replayButtonRef.current, {
      opacity: 0,
      duration: 0.3
    });

    // Capture current state
    const state = Flip.getState('.comment');
    
    // Reset state
    setVisibleComments([]);
    currentIndexRef.current = 0;

    // Animate out existing messages
    Flip.from(state, {
      absolute: true,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        // Start new animation sequence
        gsap.delayedCall(0.1, () => {
          animateNextMessage();
          currentIndexRef.current = 1;
        });
      }
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
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '20px'
        }}
      >
        {visibleComments.map((comment, index) => (
          <div 
            key={`${comment.name}-${index}`}
            className={`comment ${comment.isRight ? 'right' : 'left'}`}
            style={{ 
              position: 'relative',
              transform: 'translate3d(0, 0, 0)',
              minHeight: 'fit-content',
              margin: 0
            }}
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