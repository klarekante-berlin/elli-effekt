import React, { useRef, useEffect } from 'react';
import { useSceneState } from '../context/SceneContext';
import gsap from 'gsap';
import SplitType from 'split-type';
import '../styles/WelcomePage.css';

interface WelcomePageProps {
  onStart: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  const headphonesRef = useRef<SVGSVGElement>(null);
  const { isActive = false } = useSceneState() ?? {};

  const timeline = useRef(gsap.timeline({ paused: true }));
  const splitRefs = useRef<{ title?: SplitType; text?: SplitType }>({});

  useEffect(() => {
    if (!headphonesRef.current) return;

    // Cleanup previous splits
    if (splitRefs.current.title) splitRefs.current.title.revert();
    if (splitRefs.current.text) splitRefs.current.text.revert();

    // Create new splits
    splitRefs.current.title = new SplitType('h1', { types: 'chars' });
    splitRefs.current.text = new SplitType('.main-text', { types: 'lines' });

    // Clear previous timeline
    timeline.current.clear();

    // Initial states
    gsap.set(['.logo', '.nav-links a'], { y: -30, opacity: 0 });
    gsap.set(splitRefs.current.title.chars, { y: 50, opacity: 0 });
    gsap.set(splitRefs.current.text.lines, { y: 30, opacity: 0 });
    gsap.set(['.info-text', '.start-button'], { y: 20, opacity: 0 });
    
    // Set initial state for SVG paths
    const paths = headphonesRef.current.querySelectorAll('path');
    paths.forEach(path => {
      const length = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 0
      });
    });

    // Build timeline
    timeline.current
      .to('.logo', { 
        y: 0, 
        opacity: 1,
        duration: 2,
        ease: 'power2.out'
      })
      .to('.nav-links a', { 
        y: 0, 
        opacity: 1, 
        duration: 1.2,
        stagger: 0.3,
        ease: 'power3.out'
      }, '-=1.2')
      .addLabel('headphones', '-=0.4')
      .to('.headphones-illustration path', {
        opacity: 1,
        duration: 0.01
      }, 'headphones')
      .to('.headphones-illustration path', {
        strokeDashoffset: 0,
        duration: 2.5,
        stagger: {
          each: 0.2,
          ease: 'power2.inOut'
        }
      }, 'headphones')
      .to(splitRefs.current.title.chars, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.02,
        ease: 'back.out(1.7)'
      }, '-=1.5')
      .to(splitRefs.current.text.lines, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      }, '-=0.4')
      .to(['.info-text', '.start-button'], {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      }, '-=0.6');

    return () => {
      timeline.current.kill();
      if (splitRefs.current.title) splitRefs.current.title.revert();
      if (splitRefs.current.text) splitRefs.current.text.revert();
    };
  }, []);

  // Animation Control basierend auf Scene-Status
  useEffect(() => {
    if (isActive) {
      timeline.current.play();
    } else {
      timeline.current.reverse();
    }
  }, [isActive]);

  return (
    <div className="welcome-container">
      <nav className="navigation">
        <div className="logo">DER ELLI-EFFEKT</div>
        <div className="nav-links">
          <a href="/klimakrise">KLIMAKRISE</a>
          <a href="/migration">MIGRATION</a>
        </div>
      </nav>

      <div className="welcome-content">
        <div className="content-wrapper">
          <div className="headphones-wrapper">
            <svg 
              ref={headphonesRef}
              className="headphones-illustration" 
              width="162" 
              height="336" 
              viewBox="0 0 162 336" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M50.6785 197.134L52.7225 200.935C47.3794 205.92 47.0925 209.542 50.2123 216.714C53.7983 223.993 59.3207 230.125 66.2058 234.428C81.7332 245.401 93.7462 258.849 97.1888 278.644C100.058 295.211 104.146 311.599 107.409 328.13C107.445 330.64 107.086 333.115 106.297 335.517L104.217 335.732C102.962 333.617 101.851 331.393 100.846 329.134C97.1888 319.345 97.1171 309.089 96.364 298.797C95.3599 275.058 83.6696 253.004 64.5921 238.839C59.2849 234.895 54.1928 230.663 49.3517 226.109C44.152 221.555 41.8211 214.526 43.2555 207.784C43.9369 202.585 40.8529 197.6 35.9043 195.879C21.9189 189.604 9.54725 181.32 3.77381 166.187C-0.170778 155.824 1.87323 145.711 5.53094 135.742C5.9254 134.164 6.60674 132.694 7.50323 131.331C12.6671 125.127 11.0892 119.605 7.64667 112.828C2.48285 103.898 -0.170778 93.7142 0.0085213 83.3866C0.151961 74.4216 0.797438 65.4925 2.01667 56.5992C5.3875 39.2789 12.9181 24.3254 30.2025 16.5438C39.5261 12.3482 48.4911 6.89746 58.2449 4.20796C81.8049 -2.31853 105.401 -1.70891 127.777 9.26421C140.292 15.5397 149.759 26.5845 154.063 39.8885C159.011 51.6864 161.557 64.345 161.593 77.1469C161.091 89.16 159.083 101.065 151.947 111.393C150.118 114.011 148.468 116.808 147.034 119.677C146.711 120.86 146.926 122.079 147.608 123.083C156.393 135.599 158.545 151.592 153.381 166.008C150.01 176.228 141.87 184.189 131.578 187.308C120.605 191.253 109.309 191.683 98.157 193.692C96.3998 193.548 94.822 192.508 93.9972 190.966C93.0649 188.671 92.7063 186.161 92.9214 183.687C93.9255 170.562 97.2605 157.688 102.783 145.711C107.014 137.033 110.816 128.14 115.441 119.677C118.633 113.867 121.717 113.043 126.558 114.656C127.921 114.764 128.925 115.911 128.817 117.274C128.817 117.74 128.602 118.206 128.315 118.601C123.044 130.865 117.88 143.129 112.788 155.429C108.234 166.51 103.823 177.626 99.3045 188.779C104.755 190.643 108.556 189.639 110.457 185.515C116.768 171.674 122.578 157.617 129.068 143.846C132.798 135.383 137.316 127.315 142.516 119.677C150.692 108.883 155.927 96.1527 157.648 82.7411C158.904 71.6604 157.505 60.4362 153.56 50.0369C151.194 43.2594 148.433 36.6611 145.241 30.2064C142.587 25.8673 139.611 21.7434 136.312 17.8706C134.77 19.7712 133.838 20.8828 132.941 21.9945C131.399 23.3571 131.256 25.7597 132.618 27.3017C132.977 27.6962 133.371 27.9831 133.838 28.2341C139.288 32.358 143.161 38.239 144.775 44.8731C147.213 53.587 148.935 62.4803 149.867 71.4452C150.226 78.0793 147.679 84.8568 146.317 91.5626C145.886 93.6783 145.062 95.6865 144.38 97.8381C146.245 98.627 148.074 99.4876 149.831 100.492C150.584 101.209 151.194 102.07 151.66 103.002C150.728 103.396 149.723 103.576 148.719 103.576C146.783 103.074 144.847 102.464 142.982 101.711C139.145 107.018 136.85 113.76 128.961 117.418C129.463 116.162 130.036 114.907 130.718 113.724C141.763 98.4118 148.719 81.9163 145.313 62.4803C143.484 52.1168 141.691 41.4664 133.658 33.7924C129.714 30.4215 125.267 27.6603 120.498 25.6163C104.719 17.763 87.6142 20.058 71.0469 20.6318C60.2531 20.9904 49.029 22.2813 39.6337 29.2023C37.4104 30.6726 34.9719 31.7483 32.4258 32.4297C28.1585 33.8282 24.7518 37.1273 23.2457 41.3588C17.8309 53.7304 14.8904 67.0703 14.6393 80.5895C14.6035 90.9171 17.5799 101.03 23.2099 109.672C25.0746 112.612 28.3378 115.589 26.2938 121.29L16.5041 105.871C14.4242 107.377 12.3802 108.847 9.90584 110.604C11.914 113.616 13.7787 116.736 15.4641 119.928C22.3851 134.81 28.9116 149.871 35.976 164.681C39.5261 171.889 43.4348 178.917 47.738 185.731C49.7103 188.133 51.9695 190.285 54.4438 192.114C55.5913 191.863 57.8864 191.396 61.042 190.715C58.8546 187.846 56.8106 184.87 54.91 181.786C49.6386 171.96 44.3672 162.099 39.4902 152.058C35.1871 143.129 31.4218 133.913 27.4055 124.841C25.9711 122.546 26.6883 119.533 28.9833 118.099C29.1985 117.955 29.4495 117.848 29.6646 117.74C32.39 116.127 35.8684 117.023 37.5179 119.677C40.3867 124.733 43.1838 129.897 45.6581 135.168C49.6027 143.524 53.3321 151.951 56.9899 160.414C59.7152 166.115 61.9744 172.032 63.7674 178.057C64.5563 182.467 64.5921 186.986 63.9108 191.432C63.337 193.01 62.0461 194.229 60.4324 194.767C57.205 195.736 53.9418 196.489 50.6068 197.062L50.6785 197.134Z" />
              <path d="M14.4957 172.535C14.3164 170.562 14.173 168.626 13.9937 166.654L15.177 166.367C17.4003 171.028 19.6595 175.69 21.8828 180.388L20.5201 181.213C18.4761 178.308 16.4321 175.368 14.3881 172.463L14.4598 172.57L14.4957 172.535Z" />
            </svg>
          </div>
          <div className="welcome-text">
            <h1>Hey, Willkommen</h1>
            <p className="main-text">
              Um in den vollen Genuss zu kommen,<br />
              am besten Kopfhörer aufsetzen.
            </p>
            <p className="info-text">
              Zur Info: Viele Inhalte sind KI-generiert.
            </p>
            <button onClick={onStart} className="start-button">
              START
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage; 