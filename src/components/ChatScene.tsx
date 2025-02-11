import React, { useEffect, useRef, useState } from 'react';
import { useApp, SceneId } from '../context/AppContext';
import { withSceneControl, BaseSceneProps, SceneController } from '../hoc/withSceneControl';
import gsap from 'gsap';
import messageSound1 from '../assets/audio_effects/message_01.wav';
import messageSound2 from '../assets/audio_effects/message_02.wav';
import '../styles/ChatScene.css';

interface Comment {
  text: string;
  name: string;
  timestamp: string;
}

const comments: Comment[] = [
  { text: 'Klimasünderin!!!', name: 'EcoWarrior92', timestamp: '14:22' },
  { text: 'Statt einen positiven impact zu haben, animierst du andere unserer Umwelt zu schaden schäm dich!', name: 'GreenLife', timestamp: '14:22' },
  { text: 'Denkst du wirklich, es ist nachhaltig, eine Frucht zu feiern, die tausende Kilometer fliegt', name: 'PlanetProtector', timestamp: '14:23' },
  { text: 'Wälder werden gerodet, Wasserquellen versiegen, und das alles für deinen grünen Toast?', name: 'EarthFirst', timestamp: '14:23' },
  { text: 'Mach dir mal Gedanken, ob dein Frühstück wirklich so nen Fußabdruck hinterlassen muss - peinlich!', name: 'SustainableSarah', timestamp: '14:24' },
  { text: 'Dörfer trocknen aus nur, damit du dein Insta mit einem "healthy Avocado Toast" aufpeppen kannst', name: 'ClimateChampion', timestamp: '14:24' },
  { text: 'Hoffentlich bleibt dir das Essen im Hals stecken.', name: 'VeganVigilante', timestamp: '14:25' },
  { text: 'Pushst den Avocado-Hype. Wasserverbrauch? CO2? Schon mal gehört? 😳 richtig nachhaltig! 🤦‍♀️', name: 'WaterGuardian', timestamp: '14:25' },
  { text: 'Avocados? Klar, schmecken gut, aber hast du mal an den Wasserverbrauch gedacht??', name: 'EcoEnforcer', timestamp: '14:26' },
  { text: 'Nichts wie eine gute Avocado … die dafür sorgt, dass ganze Ökosysteme zerstört werden. Lecker! 🙃🌱', name: 'BiodiversityBoss', timestamp: '14:26' },
  { text: 'Fühlst du dich jetzt krass mit deinem fancy Lachs und deiner wasserverschwendenden Avocado', name: 'OceanDefender', timestamp: '14:27' },
  { text: 'Sich umweltbewusst nennen und dann Lachs essen… passt eher zu einer doppelmoralischen Speisekarte', name: 'MarineProtector', timestamp: '14:27' },
  { text: 'Du bist echt bereit, die Meere zu plündern, nur für ein Insta-Bild mit Lachs? Traurig. 👀🌍', name: 'SeaShepherd', timestamp: '14:28' },
  { text: 'Nichts wie Lachs zum Brunch… und Überfischung für die Meere. Na, guten Appetit!', name: 'FishFighter', timestamp: '14:28' },
  { text: 'Zum kotzen!!', name: 'EcoRage', timestamp: '14:29' }
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
  const { dispatch } = useApp();
  const sceneId: SceneId = 'chat-scene';
  const visibleMessagesCount = 6;
  const [visibleComments, setVisibleComments] = useState<Comment[]>([]);

  // Audio Setup
  const audioRef1 = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef1.current = new Audio(messageSound1);
    audioRef2.current = new Audio(messageSound2);
    
    if (audioRef1.current) audioRef1.current.volume = 0.4;
    if (audioRef2.current) audioRef2.current.volume = 0.4;

    return () => {
      if (audioRef1.current) audioRef1.current = null;
      if (audioRef2.current) audioRef2.current = null;
    };
  }, []);

  // Initial Setup
  useEffect(() => {
    setVisibleComments([]);
  }, []);

  const clearMessageInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

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

  const animateMessages = (currentIndex: number) => {
    if (!commentsRef.current || currentIndex >= comments.length) return;

    playMessageSound(currentIndex);
    
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    
    const tl = gsap.timeline({
      defaults: {
        ease: 'power2.out',
        duration: 0.4
      }
    });
    
    timelineRef.current = tl;

    // Erste 6 Nachrichten
    if (currentIndex < visibleMessagesCount) {
      setVisibleComments(prev => [...prev, comments[currentIndex]]);
      
      // Warten auf das nächste React-Update
      gsap.delayedCall(0, () => {
        const messageElements = Array.from(commentsRef.current?.children || []);
        const currentElement = messageElements[currentIndex];
        
        if (currentElement) {
          tl.fromTo(currentElement,
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
        }
      });
      
      return;
    }

    // Ab der 7. Nachricht
    const newComment = comments[currentIndex];
    const messageElements = Array.from(commentsRef.current?.children || []);
    
    if (messageElements.length === 0) return;

    // Oberste Nachricht ausblenden und nach hinten schieben
    if (messageElements[0]) {
      tl.to(messageElements[0], {
        opacity: 0,
        scale: 0.8,
        z: -100,
        duration: 0.6,
        ease: 'power2.inOut'
      });
    }

    // Bestehende Nachrichten nach oben schieben
    const remainingMessages = messageElements.slice(1);
    if (remainingMessages.length > 0) {
      tl.to(remainingMessages, {
        y: '-=80',
        duration: 0.6,
        ease: 'power2.inOut',
        stagger: {
          amount: 0.1,
          from: "start"
        }
      }, '<');
    }

    // State aktualisieren
    setVisibleComments(prev => [...prev.slice(1), newComment]);

    // Warten auf das nächste React-Update für die neue Nachricht
    gsap.delayedCall(0, () => {
      const updatedMessageElements = Array.from(commentsRef.current?.children || []);
      const newElement = updatedMessageElements[visibleMessagesCount - 1];
      
      if (newElement) {
        tl.fromTo(newElement,
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
          },
          '-=0.4'
        );
      }
    });
  };

  // Play/Pause Control
  useEffect(() => {
    if (isPlaying) {
      if (currentIndexRef.current === 0) {
        // Erste Initialisierung
        animateMessages(currentIndexRef.current);
        clearMessageInterval();
        intervalRef.current = setInterval(() => {
          const nextIndex = currentIndexRef.current + 1;
          if (nextIndex < comments.length) {
            currentIndexRef.current = nextIndex;
            animateMessages(currentIndexRef.current);
          } else {
            clearMessageInterval();
            dispatch({
              type: 'UPDATE_SCENE_STATE',
              payload: { sceneId, updates: { isComplete: true } }
            });
            if (onComplete) onComplete();
            gsap.to(replayButtonRef.current, {
              opacity: 1,
              duration: 0.5,
              ease: 'power2.out'
            });
          }
        }, 2000);
      } else {
        // Fortsetzen von der letzten Position
        clearMessageInterval();
        intervalRef.current = setInterval(() => {
          const nextIndex = currentIndexRef.current + 1;
          if (nextIndex < comments.length) {
            currentIndexRef.current = nextIndex;
            animateMessages(currentIndexRef.current);
          } else {
            clearMessageInterval();
            dispatch({
              type: 'UPDATE_SCENE_STATE',
              payload: { sceneId, updates: { isComplete: true } }
            });
            if (onComplete) onComplete();
            gsap.to(replayButtonRef.current, {
              opacity: 1,
              duration: 0.5,
              ease: 'power2.out'
            });
          }
        }, 2000);
      }
    } else {
      clearMessageInterval();
    }

    // Cleanup beim Unmount
    return () => {
      clearMessageInterval();
    };
  }, [isPlaying, dispatch, onComplete]);

  const handleReplay = () => {
    if (!commentsRef.current) return;

    // Zuerst alle Intervalle löschen
    clearMessageInterval();

    // Animation des Replay-Buttons
    gsap.to(replayButtonRef.current, {
      opacity: 0,
      duration: 0.3
    });

    // State und Index zurücksetzen
    setVisibleComments([]);
    currentIndexRef.current = 0;
    
    // Kurze Verzögerung für React State Update
    gsap.delayedCall(0.1, () => {
      // Erste Nachricht anzeigen
      animateMessages(0);
      
      // Intervall für weitere Nachrichten starten
      intervalRef.current = setInterval(() => {
        const nextIndex = currentIndexRef.current + 1;
        if (nextIndex < comments.length) {
          currentIndexRef.current = nextIndex;
          animateMessages(currentIndexRef.current);
        } else {
          clearMessageInterval();
          dispatch({
            type: 'UPDATE_SCENE_STATE',
            payload: { sceneId, updates: { isComplete: true } }
          });
          if (onComplete) onComplete();
          gsap.to(replayButtonRef.current, {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out'
          });
        }
      }, 2000);
      
      if (!isPlaying) {
        controller?.play();
      }
    });
  };

  return (
    <div className={`chat-scene ${isPlaying ? 'active' : ''}`}>
      <div ref={commentsRef} className="chat-messages">
        {visibleComments.map((comment, index) => (
          <div 
            key={`${comment.name}-${index}`}
            className="comment"
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