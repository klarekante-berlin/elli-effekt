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

const ChatScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);
  const visibleMessagesCount = 5;

  const animateMessages = (currentIndex: number) => {
    if (!containerRef.current || !commentsRef.current) return;

    const messageElements = Array.from(commentsRef.current.children);
    const messageSpacing = 30;
    const topPadding = 40;
    
    // Berechne Start- und Endindex für sichtbare Nachrichten
    const startIndex = Math.max(0, currentIndex - visibleMessagesCount + 1);
    const endIndex = currentIndex;
    let currentY = topPadding;

    // Fade out älteste Nachricht nach oben
    if (startIndex > 0) {
      const oldestMessage = messageElements[startIndex - 1];
      gsap.to(oldestMessage, {
        y: -100,
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: 'power2.inOut'
      });
    }

    // Positioniere sichtbare Nachrichten
    for (let i = startIndex; i <= endIndex; i++) {
      const element = messageElements[i];
      if (element) {
        const elementHeight = (element as HTMLElement).offsetHeight;
        
        // Wenn es die neue Nachricht ist, animiere sie von unten
        if (i === currentIndex) {
          gsap.fromTo(element,
            { 
              y: window.innerHeight,
              opacity: 0,
              scale: 0.9
            },
            { 
              y: currentY,
              opacity: 1,
              scale: 1,
              duration: 0.5,
              ease: 'power2.out'
            }
          );
        } else {
          // Andere Nachrichten nach oben schieben
          gsap.to(element, {
            y: currentY,
            duration: 0.5,
            ease: 'power2.inOut'
          });
        }
        
        currentY += elementHeight + messageSpacing;
      }
    }

    // Verstecke alle anderen Nachrichten
    messageElements.forEach((element, index) => {
      if (index < startIndex || index > endIndex) {
        gsap.set(element, { 
          opacity: 0,
          y: window.innerHeight,
          scale: 0.9
        });
      }
    });
  };

  useEffect(() => {
    // Initial alle Nachrichten verstecken außer der ersten
    if (!commentsRef.current) return;
    
    const messageElements = Array.from(commentsRef.current.children);
    messageElements.forEach((element, index) => {
      if (index === 0) {
        gsap.fromTo(element,
          { 
            y: window.innerHeight,
            opacity: 0,
            scale: 0.9
          },
          { 
            y: 40,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out'
          }
        );
      } else {
        gsap.set(element, {
          opacity: 0,
          y: window.innerHeight,
          scale: 0.9
        });
      }
    });

    // Starte Animation für weitere Nachrichten
    const interval = setInterval(() => {
      if (currentIndexRef.current < comments.length - 1) {
        currentIndexRef.current++;
        animateMessages(currentIndexRef.current);
      } else {
        clearInterval(interval);
      }
    }, 2000);

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
        className="replay-button"
        aria-label="Konversation wiederholen"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M3 12a9 9 0 1 1 9 9 9 9 0 0 1-9-9z"/>
          <path d="M3 12h9"/>
          <path d="m9 8-4 4 4 4"/>
        </svg>
        <span>Wiederholen</span>
      </button>
    </div>
  );
};

export default ChatScene; 