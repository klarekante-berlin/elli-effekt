import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp, SceneId } from '../context/AppContext';
import { withSceneControl, BaseSceneProps, SceneController } from '../hoc/withSceneControl';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import messageSound1 from '../assets/audio_effects/message_01.wav';
import messageSound2 from '../assets/audio_effects/message_02.wav';
import '../styles/ChatScene.css';

// GSAP Plugins registrieren
gsap.registerPlugin(ScrollTrigger, Flip);

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
}

export const ChatScene: React.FC<ChatSceneProps> = ({
  id,
  controller,
  onComplete,
  isPlaying = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const replayButtonRef = useRef<HTMLButtonElement>(null);
  const currentIndexRef = useRef(0);
  const mainTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef1 = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);
  const { dispatch } = useApp();
  const sceneId: SceneId = 'chat-scene';
  const visibleMessagesCount = 6;
  const [visibleComments, setVisibleComments] = useState<Comment[]>([]);

  // Funktion zum Aufräumen des Intervalls
  const clearMessageInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Aufräumen beim Unmount
  useEffect(() => {
    return () => {
      clearMessageInterval();
      if (mainTimelineRef.current) {
        mainTimelineRef.current.kill();
      }
    };
  }, [clearMessageInterval]);

  // Audio Setup mit useGSAP
  const { contextSafe: audioContextSafe } = useGSAP(() => {
    // Audio-Objekte erstellen und konfigurieren
    audioRef1.current = new Audio(messageSound1);
    audioRef2.current = new Audio(messageSound2);
    
    if (audioRef1.current) audioRef1.current.volume = 0.4;
    if (audioRef2.current) audioRef2.current.volume = 0.4;

    // Preload der Audio-Dateien
    audioRef1.current?.load();
    audioRef2.current?.load();

    return () => {
      // Korrekte Cleanup der Audio-Ressourcen
      if (audioRef1.current) {
        audioRef1.current.pause();
        audioRef1.current.src = '';
        audioRef1.current = null;
      }
      if (audioRef2.current) {
        audioRef2.current.pause();
        audioRef2.current.src = '';
        audioRef2.current = null;
      }
    };
  }, { scope: containerRef });

  const playMessageSound = audioContextSafe((index: number) => {
    const audio = index % 2 === 0 ? audioRef1.current : audioRef2.current;
    
    if (audio) {
      // Audio zurücksetzen und abspielen
      audio.currentTime = 0;
      audio.play().catch(error => console.log('Audio playback failed:', error));
    }
  });

  // Animation Context
  const { contextSafe } = useGSAP(() => {
    // Haupttimeline erstellen
    mainTimelineRef.current = gsap.timeline({
      paused: true,
      defaults: {
        ease: 'power2.out',
        duration: 0.4
      }
    });

    return () => {
      if (mainTimelineRef.current) {
        mainTimelineRef.current.kill();
      }
    };
  }, { scope: containerRef });

  // Animationsfunktionen
  const animateMessageOut = contextSafe((element: HTMLElement) => {
    console.log('🎭 Message Out Animation startet', { element });
    
    const tl = gsap.timeline({
      defaults: { 
        ease: "power3.inOut",
        duration: 0.8
      }
    });

    tl.to(element, {
      opacity: 0,
      y: -100,
      scale: 0.8,
      z: -100,
      rotateX: -45,
      transformOrigin: "50% 50% -100",
      onComplete: () => console.log('🎭 Message Out Animation abgeschlossen')
    });

    return tl;
  });

  const animateMessagesUp = contextSafe((elements: HTMLElement[]) => {
    if (!elements.length) {
      console.log('⚠️ Keine Elemente für Up-Animation gefunden');
      return gsap.timeline();
    }

    console.log('🎭 Messages Up Animation startet', { elementCount: elements.length });
    
    // Berechne die tatsächliche Höhe des ersten Elements
    const messageHeight = elements[0]?.offsetHeight || 80;
    console.log('📏 Berechnete Nachrichtenhöhe:', messageHeight);

    // Timeline für die Animation
    const tl = gsap.timeline({
      onStart: () => console.log('🎬 Messages Up Animation startet'),
      onComplete: () => console.log('✅ Messages Up Animation abgeschlossen'),
      onInterrupt: () => console.log('⚠️ Messages Up Animation unterbrochen')
    });

    try {
      // Setze Container-Style für besseres Overflow-Handling
      if (commentsRef.current) {
        gsap.set(commentsRef.current, {
          height: `${messageHeight * visibleMessagesCount}px`,
          overflow: 'hidden'
        });
      }

      // Setze initiale Styles für smooth transition
      elements.forEach((el, i) => {
        gsap.set(el, {
          position: 'relative',
          zIndex: 1,
          overflow: 'visible',
          immediateRender: true
        });
      });

      // Animiere jedes Element einzeln
      elements.forEach((el, i) => {
        tl.to(el, {
          y: `-=${messageHeight}`,
          duration: 0.5,
          ease: "power2.inOut",
          clearProps: "zIndex", // Cleanup nach Animation
          onStart: () => {
            gsap.set(el, { zIndex: 10 + i }); // Sicherstellen, dass keine Überlappung stattfindet
          }
        }, i * 0.08); // Leichte Verzögerung zwischen den Elementen
      });

      // Zusätzliche visuelle Effekte für smoothere Bewegung
      elements.forEach((el, i) => {
        tl.to(el, {
          scale: 0.98,
          duration: 0.2,
          ease: "power1.in"
        }, i * 0.08)
        .to(el, {
          scale: 1,
          duration: 0.3,
          ease: "power1.out"
        }, `>-0.1`);
      });

    } catch (error) {
      console.warn('❌ Messages Up Animation fehlgeschlagen:', error);
      // Einfache Fallback Animation
      elements.forEach((el, i) => {
        tl.to(el, {
          y: `-=${messageHeight}`,
          duration: 0.5,
          ease: "power2.inOut",
          delay: i * 0.08
        }, 0);
      });
    }

    return tl;
  });

  const animateMessageIn = contextSafe((element: HTMLElement) => {
    console.log('🎭 Message In Animation startet', { element });
    
    const tl = gsap.timeline({
      defaults: {
        ease: 'back.out(1.2)',
        duration: 0.8
      }
    });

    tl.fromTo(element,
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
        onComplete: () => console.log('🎭 Message In Animation abgeschlossen')
      }
    );

    return tl;
  });

  const animateMessages = contextSafe((currentIndex: number) => {
    if (!commentsRef.current || currentIndex >= comments.length) {
      console.log('⚠️ Animation nicht möglich: Ungültiger Index oder fehlende Referenz');
      return;
    }

    console.log('🎬 Neue Nachricht Animation startet', { currentIndex });
    
    const mainTl = gsap.timeline({
      defaults: {
        ease: 'power2.out',
        duration: 0.4
      }
    });

    playMessageSound(currentIndex);
    
    // Erste 6 Nachrichten
    if (currentIndex < visibleMessagesCount) {
      setVisibleComments(prev => [...prev, comments[currentIndex]]);
      
      requestAnimationFrame(() => {
        const messageElements = Array.from(commentsRef.current?.children || []);
        const currentElement = messageElements[currentIndex] as HTMLElement;
        
        if (currentElement) {
          mainTl.add(animateMessageIn(currentElement));
        }
      });
      
      return;
    }

    // Ab der 7. Nachricht
    const newComment = comments[currentIndex];
    const messageElements = Array.from(commentsRef.current?.children || []) as HTMLElement[];
    
    if (messageElements.length === 0) return;

    // Oberste Nachricht ausblenden
    if (messageElements[0]) {
      mainTl.add(animateMessageOut(messageElements[0]));
    }

    mainTl.addLabel('exitComplete', '+=0.4');

    // State aktualisieren und Up-Animation vorbereiten
    mainTl.call(() => {
      setVisibleComments(prev => [...prev.slice(1), newComment]);
      
      requestAnimationFrame(() => {
        // Wichtig: Wir nehmen alle Nachrichten außer der letzten (neue Nachricht)
        const remainingMessages = Array.from(commentsRef.current?.children || []);
        const messagesToAnimate = remainingMessages
          .slice(0, remainingMessages.length - 1)
          .map(el => el as HTMLElement);
        
        if (messagesToAnimate.length > 0) {
          console.log('🔄 Starte Up-Animation für verbleibende Nachrichten', { count: messagesToAnimate.length });
          mainTl.add(animateMessagesUp(messagesToAnimate), '+=0.1');
        }

        mainTl.addLabel('upComplete', '+=0.3');
        
        // Die neue Nachricht ist die letzte im Container
        const newElement = commentsRef.current?.children[visibleMessagesCount - 1] as HTMLElement;
        if (newElement) {
          gsap.set(newElement, { 
            opacity: 0,
            y: 80,
            scale: 0.8,
            z: -100,
            position: 'relative' // Wichtig für korrekte Positionierung
          });
          
          mainTl.add(animateMessageIn(newElement), 'upComplete');
        }
      });
    }, [], 'exitComplete');
  });

  // Play/Pause Control mit useGSAP
  useGSAP(() => {
    // Zuerst altes Intervall aufräumen
    clearMessageInterval();

    if (isPlaying) {
      console.log('🎬 Starting chat scene animation');
      
      // Neues Intervall nur erstellen, wenn noch Nachrichten übrig sind
      if (currentIndexRef.current < comments.length) {
        intervalRef.current = setInterval(() => {
          if (currentIndexRef.current < comments.length) {
            animateMessages(currentIndexRef.current);
            currentIndexRef.current++;
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

      return () => clearMessageInterval();
    }
  }, { 
    dependencies: [isPlaying, clearMessageInterval],
    scope: containerRef,
    revertOnUpdate: true
  });

  // Replay Handler
  const handleReplay = contextSafe(() => {
    if (!commentsRef.current) return;

    console.log('🔄 Replaying chat scene');
    
    // Zuerst altes Intervall aufräumen
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
      animateMessages(0);
      currentIndexRef.current = 1;
      
      if (!isPlaying) {
        controller?.play();
      }
    });
  });

  return (
    <div className="chat-scene" ref={containerRef}>
      <div 
        ref={commentsRef} 
        className="chat-messages"
        style={{
          position: 'relative',
          height: '480px', // 6 * 80px (Standard-Nachrichtenhöhe)
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

const WrappedChatScene = withSceneControl(ChatScene, {
  setupScene: (controller) => {
    return {
      onEnter: () => {
        console.log('🎭 Entering chat scene');
        controller.play();
      },
      onLeave: () => {
        console.log('👋 Leaving chat scene');
        controller.pause();
      },
      onEnterBack: () => {
        console.log('🔙 Re-entering chat scene');
        controller.play();
      },
      onLeaveBack: () => {
        console.log('↩️ Leaving chat scene backwards');
        controller.pause();
      }
    };
  }
});

export default WrappedChatScene; 