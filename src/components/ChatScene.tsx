import React, { useEffect, useRef, useState } from 'react';
import { useApp, SceneId } from '../context/AppContext';
import { withSceneControl, BaseSceneProps, SceneController } from '../hoc/withSceneControl';
import gsap from 'gsap';
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
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const { dispatch } = useApp();
  const sceneId: SceneId = 'chat-scene';

  useEffect(() => {
    if (!commentsRef.current) return;

    // Initial Setup
    gsap.set(commentsRef.current.children, {
      opacity: 0,
      y: 50,
      display: 'none'
    });

    const timeline = gsap.timeline({
      paused: true,
      onComplete: () => {
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
    });

    // Erste 6 Nachrichten erscheinen nacheinander
    for (let i = 0; i < 6; i++) {
      timeline.fromTo(commentsRef.current.children[i],
        {
          display: 'flex',
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'back.out(1.2)'
        },
        i * 0.8
      );
    }

    // Ab der 7. Nachricht: Nachrücken
    for (let i = 6; i < comments.length; i++) {
      const position = i * 0.8;

      // Oberste Nachricht ausblenden
      timeline.to(commentsRef.current.children[i - 6], {
        opacity: 0,
        y: '-=50',
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          if (commentsRef.current) {
            gsap.set(commentsRef.current.children[i - 6], { display: 'none' });
          }
        }
      }, position);

      // Bestehende Nachrichten nach oben schieben
      const visibleMessages = Array.from(commentsRef.current.children).slice(i - 5, i);
      timeline.to(visibleMessages, {
        y: (index) => {
          const currentY = gsap.getProperty(visibleMessages[index], "y") as number;
          return currentY - 80;
        },
        duration: 0.6,
        ease: 'power2.inOut'
      }, position);

      // Neue Nachricht einblenden
      timeline.fromTo(commentsRef.current.children[i],
        {
          display: 'flex',
          opacity: 0,
          y: 80
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'back.out(1.2)'
        },
        position
      );
    }

    timelineRef.current = timeline;

    return () => {
      timeline.kill();
    };
  }, [dispatch, onComplete]);

  // Play/Pause Control
  useEffect(() => {
    if (!timelineRef.current) return;
    
    if (isPlaying) {
      timelineRef.current.play();
    } else {
      timelineRef.current.pause();
    }
  }, [isPlaying]);

  const handleReplay = () => {
    if (!timelineRef.current || !commentsRef.current) return;

    // Verstecke Replay-Button
    gsap.to(replayButtonRef.current, {
      opacity: 0,
      duration: 0.3
    });

    // Reset aller Nachrichten
    gsap.set(commentsRef.current.children, {
      opacity: 0,
      y: 50,
      display: 'none'
    });

    // Starte Animation neu
    timelineRef.current.restart();
    controller?.play();
  };

  return (
    <div className={`chat-scene ${isPlaying ? 'active' : ''}`}>
      <div ref={commentsRef} className="chat-messages">
        {comments.map((comment, index) => (
          <div 
            key={`${comment.name}-${comment.timestamp}`}
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