import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import '../styles/ChatScene.css';

interface Comment {
  text: string;
  name: string;
  timestamp: string;
  isRight: boolean;
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
];

export const ChatScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const messages = messagesRef.current?.children;
    if (!messages) return;

    const tl = gsap.timeline();

    // Eingangsanimation für alle Nachrichten
    tl.fromTo(
      messages,
      {
        opacity: 0,
        y: 20,
        rotateX: -20,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      }
    );

    // Animation für das Ausblenden der obersten Nachricht
    tl.to(messages[0], {
      y: -100,
      opacity: 0,
      scale: 0.9,
      filter: 'blur(8px)',
      z: -200,
      duration: 0.4,
      ease: 'power2.inOut',
      delay: 1 // Verzögerung vor dem Ausblenden
    });

    // Optional: Nachrücken der anderen Nachrichten
    gsap.to(Array.from(messages).slice(1), {
      y: '-=80', // Anpassen basierend auf Ihrer Nachrichtenhöhe
      duration: 0.4,
      ease: 'power2.inOut',
      delay: 1.4 // Startet nach dem Ausblenden der ersten Nachricht
    });

  }, { scope: containerRef });

  return (
    <div className="chat-scene" ref={containerRef}>
      <div className="chat-messages" ref={messagesRef}>
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
      <button className="replay-button">Replay</button>
    </div>
  );
}; 