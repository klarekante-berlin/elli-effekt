import React from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import Section from './components/Section';
import AnimatedText from './components/AnimatedText';
import BackgroundTexture from './components/BackgroundTexture';
import './styles/global.css';

const App: React.FC = () => {
  // Lenis scroll callback
  const lenis = useLenis(({ scroll }: { scroll: number }) => {
    // Optional: Hier können wir auf Scroll-Events reagieren
    console.log('Scrolling', scroll);
  });

  // Scroll-to-top Funktion mit Lenis
  const scrollToTop = () => {
    lenis?.scrollTo(0, { immediate: false });
  };

  return (
    <ReactLenis root>
      <BackgroundTexture />
      <div className="App">
        <Section height="100vh">
          <AnimatedText 
            text="Willkommen zum Scrollytelling"
            animation="chars"
            stagger={0.05}
            duration={0.8}
          />
          <AnimatedText 
            text="Scrollen Sie nach unten, um die smooth scroll Effekte zu sehen."
            tag="p"
            animation="words"
            stagger={0.02}
            delay={0.5}
          />
        </Section>

        <Section height="120vh">
          <AnimatedText 
            text="Zweite Section"
            tag="h2"
            animation="fadeUp"
          />
          <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <AnimatedText
              tag="p"
              animation="fadeIn"
              text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
            />
            <br />
            <AnimatedText
              tag="p"
              animation="fadeIn"
              delay={0.2}
              text="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            />
          </div>
        </Section>

        <Section height="80vh">
          <AnimatedText 
            text="Dritte Section"
            tag="h2"
            animation="chars"
          />
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                style={{
                  width: '300px',
                  height: '200px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                Karte {num}
              </div>
            ))}
          </div>
        </Section>

        <Section height="100vh">
          <AnimatedText 
            text="Vierte Section"
            tag="h2"
            animation="fadeUp"
          />
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <AnimatedText
              tag="p"
              animation="words"
              text="Dies ist die letzte Section unserer Test-Seite."
              style={{ fontSize: '1.25rem', marginBottom: '2rem' }}
            />
            <button
              className="scroll-button"
              onClick={scrollToTop}
            >
              Nach oben scrollen
            </button>
          </div>
        </Section>
      </div>
    </ReactLenis>
  );
};

export default App;
