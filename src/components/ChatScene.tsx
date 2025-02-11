import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp, SceneId } from '../context/AppContext';
import { withSceneControl, BaseSceneProps, SceneController } from '../hoc/withSceneControl';
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

interface ChatSceneProps extends BaseSceneProps {
  controller?: SceneController;
  isPlaying?: boolean;
  isActive?: boolean;
}

const ChatScene: React.FC<ChatSceneProps> = ({
  id,
  controller,
  onComplete,
  isPlaying = false
}) => {
  const commentsRef = useRef<HTMLDivElement>(null);
  const replayButtonRef = useRef<HTMLButtonElement>(null);
  const currentIndexRef = useRef(0);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const visibleMessagesCount = 5;
  
  // Audio Refs
  const audioRef1 = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);

  const { dispatch } = useApp();
  const sceneId: SceneId = 'chat-scene';

  // Audio Setup
  useEffect(() => {
    audioRef1.current = new Audio(messageSound1);
    audioRef2.current = new Audio(messageSound2);
    
    if (audioRef1.current) audioRef1.current.volume = 0.4;
    if (audioRef2.current) audioRef2.current.volume = 0.4;

    if (audioRef1.current) audioRef1.current.preload = 'auto';
    if (audioRef2.current) audioRef2.current.preload = 'auto';

    return () => {
      if (audioRef1.current) audioRef1.current = null;
      if (audioRef2.current) audioRef2.current = null;
    };
  }, []);

  // Initial Setup - Hide all messages
  useEffect(() => {
    if (!commentsRef.current) return;
    
    const messageElements = Array.from(commentsRef.current.children);
    messageElements.forEach((element) => {
      gsap.set(element, {
        opacity: 0,
        y: window.innerHeight,
        scale: 0.90,
        filter: 'blur(0px)',
        z: 100
      });
    });
  }, []);

  // Animation Control
  useEffect(() => {
    if (!commentsRef.current) return;

    const timeline = gsap.timeline({ 
      paused: true,
      onComplete: () => {
        dispatch({
          type: 'UPDATE_SCENE_STATE',
          payload: {
            sceneId,
            updates: { isComplete: true }
          }
        });
        if (onComplete) {
          onComplete();
        }
        showReplayButton();
      }
    });

    timelineRef.current = timeline;

    const messageElements = Array.from(commentsRef.current.children);
    const totalMessages = messageElements.length;
    const visibleMessages = Math.min(visibleMessagesCount, totalMessages);
    const messageSpacing = 40;
    const topPadding = 50;
    const messageHeight = 120;

    // Initial Setup - Alle Nachrichten verstecken
    messageElements.forEach((element) => {
      gsap.set(element, {
        opacity: 0,
        y: window.innerHeight,
        display: 'flex',
        scale: 1
      });
    });

    // Animation für sichtbare Nachrichten
    messageElements.forEach((element, index) => {
      const delay = index * 2;
      let currentY = topPadding + (index * (messageHeight + messageSpacing));

      // Einblend-Animation für neue Nachricht
      timeline.to(element, {
        opacity: 1,
        y: currentY,
        duration: 1.2,
        ease: 'power2.out',
        onStart: () => {
          playMessageSound(index);
        }
      }, delay);

      // Wenn mehr als visibleMessages sichtbar sind, vorherige Nachrichten nach oben schieben
      if (index >= visibleMessages) {
        const removeDelay = delay;
        const prevElements = messageElements.slice(Math.max(0, index - visibleMessages), index);
        
        // Berechne die Position für jede vorherige Nachricht
        prevElements.forEach((prevElement, prevIndex) => {
          const prevY = topPadding + ((prevIndex - 1) * (messageHeight + messageSpacing));
          const isOldest = prevIndex === 0;
          
          // Fadeout-Animation für die älteste Nachricht
          if (isOldest) {
            timeline.to(prevElement, {
              y: prevY - messageHeight - messageSpacing,
              opacity: 0,
              scale: 0.95,
              duration: 0.8,
              ease: 'power2.in'
            }, removeDelay);
          } else {
            // Verschiebe andere Nachrichten nach oben
            timeline.to(prevElement, {
              y: prevY,
              opacity: 0.7,
              scale: 1,
              duration: 0.8,
              ease: 'power2.inOut'
            }, removeDelay);
          }
        });
      }
    });

    return () => {
      timeline.kill();
    };
  }, [onComplete, dispatch]);

  // Play/Pause Control
  useEffect(() => {
    if (!timelineRef.current) return;

    if (isPlaying) {
      timelineRef.current.play();
    } else {
      timelineRef.current.pause();
    }
  }, [isPlaying]);

  const playMessageSound = (index: number) => {
    const isEven = index % 2 === 0;
    const audio = isEven ? audioRef1.current : audioRef2.current;
    
    if (audio) {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => console.log('Audio playback failed:', error));
      }
    }
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
    if (!timelineRef.current || !commentsRef.current) return;

    if (replayButtonRef.current) {
      gsap.to(replayButtonRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.in'
      });
    }
    
    // Reset aller Nachrichten
    const messageElements = Array.from(commentsRef.current.children);
    messageElements.forEach((element) => {
      gsap.set(element, {
        opacity: 0,
        y: window.innerHeight,
        display: 'flex',
        scale: 1
      });
    });
    
    currentIndexRef.current = 0;
    timelineRef.current.restart();
    controller?.play();
  };

  return (
    <div className={`chat-scene ${isPlaying ? 'active' : ''}`}>
      <div ref={commentsRef} className="chat-messages">
        {comments.map((comment, index) => (
          <div 
            key={index} 
            className={`comment ${comment.isRight ? 'right' : 'left'}`}
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

const WrappedChatScene = withSceneControl(ChatScene, {
  setupScene: (controller) => {
    return {
      onEnter: () => {
        controller.play();
      },
      onLeave: () => {
        controller.pause();
      },
      onEnterBack: () => {
        controller.play();
      },
      onLeaveBack: () => {
        controller.pause();
      }
    };
  }
});

export default WrappedChatScene; 