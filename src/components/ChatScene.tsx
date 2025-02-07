import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/ChatScene.css';
import messageSound1 from '../assets/audio_effects/message_01.wav';
import messageSound2 from '../assets/audio_effects/message_02.wav';

gsap.registerPlugin(ScrollTrigger);

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

interface ChatSceneProps {
  onComplete?: () => void;
}

const ChatScene: React.FC<ChatSceneProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const replayButtonRef = useRef<HTMLButtonElement>(null);
  const currentIndexRef = useRef(0);
  const visibleMessagesCount = 5;
  
  // Audio Refs
  const audioRef1 = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Audio Setup
    audioRef1.current = new Audio(messageSound1);
    audioRef2.current = new Audio(messageSound2);
    
    // Setze Lautstärke
    if (audioRef1.current) audioRef1.current.volume = 0.4;
    if (audioRef2.current) audioRef2.current.volume = 0.4;

    // Verhindere automatisches Abspielen
    if (audioRef1.current) audioRef1.current.preload = 'auto';
    if (audioRef2.current) audioRef2.current.preload = 'auto';
  }, []);

  const playMessageSound = (index: number) => {
    const isEven = index % 2 === 0;
    const audio = isEven ? audioRef1.current : audioRef2.current;
    
    if (audio) {
      audio.currentTime = 0; // Reset Audio
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => console.log('Audio playback failed:', error));
      }
    }
  };

  const animateMessages = (currentIndex: number) => {
    if (!containerRef.current || !commentsRef.current) return;

    // Play sound for new message
    playMessageSound(currentIndex);

    const messageElements = Array.from(commentsRef.current.children);
    const messageSpacing = 30;
    const topPadding = 40;
    
    const tl = gsap.timeline();
    
    // Berechne Start- und Endindex für sichtbare Nachrichten
    const startIndex = Math.max(0, currentIndex - visibleMessagesCount + 1);
    const endIndex = currentIndex;
    let currentY = topPadding;

    // Fade out älteste Nachricht
    if (startIndex > 0) {
      const oldestMessage = messageElements[startIndex - 1];
      tl.to(oldestMessage, {
        y: -60,
        opacity: 0,
        scale: 0.95,
        filter: 'blur(4px)',
        z: -100,
        transformOrigin: 'center center',
        duration: 0.4,
        ease: 'power2.inOut'
      }, 0);
    }

    // Positioniere sichtbare Nachrichten
    messageElements.forEach((element, index) => {
      if (index >= startIndex && index <= endIndex) {
        const elementHeight = (element as HTMLElement).offsetHeight;
        
        if (index === currentIndex) {
          // Neue Nachricht einblenden
          tl.fromTo(element,
            { 
              y: window.innerHeight,
              opacity: 0,
              scale: 0.95,
              filter: 'blur(0px)',
              z: 0,
              transformOrigin: 'center center'
            },
            { 
              y: currentY,
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
              z: 0,
              duration: 0.4,
              ease: 'power2.out'
            },
            0.1
          );
        } else {
          // Existierende Nachrichten nach oben schieben
          tl.to(element, {
            y: currentY,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            z: 0,
            duration: 0.4,
            ease: 'power2.inOut'
          }, 0);
        }
        
        currentY += elementHeight + messageSpacing;
      } else if (index < startIndex) {
        // Ältere Nachrichten ausblenden
        tl.to(element, {
          y: -100,
          opacity: 0,
          scale: 0.9,
          filter: 'blur(8px)',
          z: -200,
          duration: 0.4,
          ease: 'power2.inOut'
        }, 0);
      } else {
        // Zukünftige Nachrichten versteckt halten
        gsap.set(element, {
          y: window.innerHeight,
          opacity: 0,
          scale: 0.95,
          filter: 'blur(0px)',
          z: 0
        });
      }
    });
  };

  const showReplayButton = () => {
    if (replayButtonRef.current) {
      gsap.fromTo(replayButtonRef.current,
        {
          opacity: 0,
          y: 20,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.7)'
        }
      );
    }
  };

  const handleReplay = () => {
    // Reset current index
    currentIndexRef.current = 0;
    
    // Hide replay button
    if (replayButtonRef.current) {
      gsap.to(replayButtonRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.in'
      });
    }
    
    // Reset all messages
    if (commentsRef.current) {
      const messageElements = Array.from(commentsRef.current.children);
      messageElements.forEach((element) => {
        gsap.set(element, {
          opacity: 0,
          y: window.innerHeight,
          scale: 0.95,
          filter: 'blur(0px)',
          z: 0
        });
      });
    }
    
    // Start animation sequence again
    setTimeout(() => {
      if (commentsRef.current) {
        const firstMessage = commentsRef.current.children[0];
        gsap.fromTo(firstMessage,
          { 
            y: window.innerHeight,
            opacity: 0,
            scale: 0.95,
            filter: 'blur(0px)',
            z: 0
          },
          { 
            y: 40,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            z: 0,
            duration: 0.5,
            ease: 'power2.out'
          }
        );
        
        // Restart interval
        const interval = setInterval(() => {
          if (currentIndexRef.current < comments.length - 1) {
            currentIndexRef.current++;
            animateMessages(currentIndexRef.current);
          } else {
            clearInterval(interval);
            showReplayButton();
            if (onComplete) {
              onComplete();
            }
          }
        }, 2000);
      }
    }, 500);
  };

  useEffect(() => {
    if (!commentsRef.current) return;
    
    const messageElements = Array.from(commentsRef.current.children);
    
    // Initial Setup
    messageElements.forEach((element, index) => {
      if (index === 0) {
        // Erste Animation mit Sound
        gsap.fromTo(element,
          { 
            y: window.innerHeight,
            opacity: 0,
            scale: 0.95,
            filter: 'blur(0px)',
            z: 0
          },
          { 
            y: 40,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            z: 0,
            duration: 0.4,
            ease: 'power2.out',
            onStart: () => playMessageSound(0)
          }
        );
      } else {
        gsap.set(element, {
          opacity: 0,
          y: window.innerHeight,
          scale: 0.95,
          filter: 'blur(0px)',
          z: 0
        });
      }
    });

    // Animation Interval
    const interval = setInterval(() => {
      if (currentIndexRef.current < comments.length - 1) {
        currentIndexRef.current++;
        animateMessages(currentIndexRef.current);
      } else {
        clearInterval(interval);
        showReplayButton();
        if (onComplete) {
          onComplete();
        }
      }
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="chat-scene" className="chat-scene" ref={containerRef}>
      <div className="comments-container" ref={commentsRef}>
        {comments.map((comment, index) => (
          <div key={index} className={`comment ${comment.isRight ? 'right' : 'left'}`}>
            <div className="avatar-container">
              <div className="avatar" />
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="name">{comment.name}</span>
                <span className="timestamp">{comment.timestamp}</span>
              </div>
              <p>{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
      <button 
        ref={replayButtonRef}
        className="replay-button"
        aria-label="Konversation wiederholen"
        onClick={handleReplay}
      >
        <svg 
          viewBox="0 0 24 24" 
          width="24" 
          height="24" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="1 4 1 10 7 10"></polyline>
          <path d="M3.51 15a9 9 0 1 0-2.13-9.36L1 10"></path>
        </svg>
        <span>Wiederholen</span>
      </button>
    </div>
  );
};

export default ChatScene; 