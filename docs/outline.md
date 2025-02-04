This guide provides a step-by-step setup for building a scrollytelling site with a focus on performance and responsive design.

I. Project Initialization
Create a New React TypeScript Project:

npx create-react-app my-scrollytelling-site --template typescript
cd my-scrollytelling-site
Use code with caution.
Bash
Install Core Dependencies:

npm install gsap @types/gsap lenis
npm install -D @types/lenis
Use code with caution.
Bash
gsap: GreenSock Animation Platform for animations.

@types/gsap: TypeScript definitions for GSAP.

lenis: Lenis smooth scroll library.

@types/lenis: Typescript declarations for lenis.

Install GSAP ScrollTrigger (GSAP Plugin):
GSAP and its plugins (including ScrollTrigger) require proper licensing for commercial use.

If you have a GreenSock Club membership (recommended):

Set up your GreenSock token for the npm registry:

npm config set @gsap:registry https://npm.greensock.com
npm config set //npm.greensock.com/:_authToken YOUR_TOKEN
Use code with caution.
Bash
Replace YOUR_TOKEN with your actual GreenSock Club token, found in your GreenSock account dashboard. This is crucial for accessing the private GSAP registry.

Install GSAP and the Plugins using npm:

npm install gsap ScrollTrigger Observer
Use code with caution.
Bash
If you have purchased individual licenses for GSAP and ScrollTrigger:

Install each necessary package.

npm install gsap ScrollTrigger Observer
Use code with caution.
Bash
You must ensure to import and to register the installed packages as plugins.

License Considerations: It is crucial to ensure that you have a valid GSAP license.

Install use-gsap for GSAP integration with React:

npm install use-gsap
Use code with caution.
Bash
II. Project Structure (TypeScript)
my-scrollytelling-site/
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Section.tsx      # Generic Section component
│   │   ├── ImageReveal.tsx  # Reusable Image Reveal component
│   │   ├── ...
│   ├── hooks/              # Custom React Hooks
│   │   ├── useLenis.ts       # Lenis smooth scroll hook
│   │   ├── ...
│   ├── sections/          # Specific sections of your scrollytelling site
│   │   ├── IntroSection.tsx
│   │   ├── DataSection.tsx
│   │   ├── Conclusion.tsx
│   ├── assets/              # Images, videos, and other assets
│   │   ├── images/
│   │   │   ├── intro-image.webp
│   │   │   ├── data-viz.webp
│   ├── styles/              # CSS or styled-components
│   │   ├── global.css
│   │   ├── Section.module.css
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Entry point
│   ├── react-app-env.d.ts  # TypeScript environment declarations
│   ├── ...
├── public/
│   ├── index.html
│   └── ...
├── .gitignore
├── package.json
├── README.md
├── tsconfig.json
└── cursor_rules.json
Use code with caution.
III. TypeScript Configuration (tsconfig.json)
Ensure your tsconfig.json is configured correctly:

{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",  // For easier imports
    "paths": {
      "@components/*": ["components/*"],
      "@sections/*": ["sections/*"],
      "@assets/*": ["assets/*"],
      "@styles/*": ["styles/*"],
      "@hooks/*": ["hooks/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "build"]
}
Use code with caution.
Json
IV. Responsiveness with CSS Modules and Custom Breakpoints
Define Breakpoints in src/styles/global.css:

/* src/styles/global.css */

:root {
  --breakpoint-xs: 320px;
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --breakpoint-xxl: 1400px;
}
Use code with caution.
Css
Create Media Queries in Component Styles (e.g., src/components/Section.module.css):

/* src/components/Section.module.css */

.section {
  padding: 20px;
}

@media (min-width: var(--breakpoint-sm)) {
  .section {
    padding: 40px;
  }
}

@media (min-width: var(--breakpoint-md)) {
  .section {
    padding: 60px;
  }
}
Use code with caution.
Css
V. Lenis Smooth Scroll Setup
Create a Custom Hook for Lenis (src/hooks/useLenis.ts):

// src/hooks/useLenis.ts
import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

const useLenis = () => {
  useEffect(() => {
    const lenis = new Lenis({
       duration: 1.2,
       easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) , // https://www.desmos.com/calculator/brs54l4xou
       orientation: 'vertical', // vertical, horizontal
       gestureOrientation: 'vertical', // vertical, horizontal, both
       smoothWheel: true,
       wheelMultiplier: 1,
       smoothTouch: false,
       touchMultiplier: 2,
       infinite: false,
       lerp: 0.1,
       direction: 'vertical', // vertical, horizontal
       classes: {
           scrolling: '-lenis-scrolling',
           stopped: '-lenis-stopped',
           locked: '-lenis-locked'
       }
     });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
};

export default useLenis;
Use code with caution.
TypeScript
Initialize Lenis Smooth Scroll, inside of src/App.tsx or at the top level component:

// src/App.tsx
import React from 'react';
import useLenis from './hooks/useLenis';
import IntroSection from "./sections/IntroSection"

const App: React.FC = () => {
  useLenis();

  return (
    <div className="App">
       <IntroSection />
      {/* Your other sections */}
    </div>
  );
};

export default App;
Use code with caution.
TypeScript
VI. GSAP, ScrollTrigger, and React Integration
Create a reusable GSAP hook, src/hooks/useGSAP.ts:

// src/hooks/useGSAP.ts
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface GSAPConfig {
  trigger: React.RefObject<HTMLElement | null> | string;
  scroller?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  markers?: boolean;
  animation: (element: HTMLElement) => gsap.core.Timeline;
  revertOnUpdate?: boolean;
}

const useGSAP = (config: GSAPConfig) => {
  const { trigger, animation, scroller, start, end, scrub, pin, markers, revertOnUpdate = true} = config;
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  useEffect(() => {
    let element;
    if (typeof trigger === 'string'){
      element = trigger;
    } else if (trigger?.current){
      element = trigger.current
    } else {
      console.warn("Trigger element not found in useGSAP hook")
      return;
    }
    if (!element) return;

    animationRef.current = animation(element);

    if (animationRef.current){
      ScrollTrigger.create({
        trigger: element,
        scroller: scroller || lenis?.content() || window, // Define to use window or lenis scroll
        start: start || 'top center',
        end: end || 'bottom center',
        scrub: scrub || false,
        pin: pin || false,
        markers: markers || false,
        scrollerProxy: {
             scrollTop(scrollPos) {
               return arguments.length ? lenis.scrollTo(scrollPos, { immediate: true }) : lenis.scroll;
             },
             getBoundingClientRect() {
               return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
             },
            // IMPORTANT! These next three properties are crucial to making ScrollTrigger work properly with Lenis!
             fixed: true,
             pinType: 'transform',
             snapDirectionalOffset: 1,
           },
        animation: animationRef.current,
        revertOnUpdate: revertOnUpdate,
        invalidateOnRefresh: true
      });
      ScrollTrigger.refresh();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [trigger, animation, scroller, start, end, scrub, pin, markers, revertOnUpdate]);
  return animationRef;
};

export default useGSAP;
Use code with caution.
TypeScript
Section Component :

// src/sections/IntroSection.tsx
import React, { useRef } from 'react';
import styles from '../styles/IntroSection.module.css';
import introImage from '../assets/images/intro-image.webp';
import useLenis from "../hooks/useLenis";
import useGSAP from '../hooks/useGSAP';

const IntroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  useLenis(); // Apply Lenis on scroll in current Section.

  const animation = (element:HTMLElement) => {
     return gsap.to(element, {
        x: 500, // Example animation: move image to the right
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center',
          end: 'center center',
          scrub: true,
          markers: process.env.NODE_ENV === 'development',
        },
      });
  }

  useGSAP({trigger: sectionRef, animation});

  return (
    <section ref={sectionRef} className={styles.container}>
      <h1>Introduction</h1>
      <img ref={imageRef} src={introImage} alt="Introduction Image" className={styles.image} />
      <p>Some introductory text...</p>
    </section>
  );
};

export default IntroSection;
Use code with caution.
TypeScript
VII. Web Core Vitals & Bundling

Use a Modern Bundler (Webpack, Parcel, or Vite):
Create React App uses Webpack. Ensure the configuration is optimised for production:

Code Splitting: Dynamically import components/sections that are not needed on initial load.

// Example of dynamic import:
const DataSection = React.lazy(() => import('./sections/DataSection'));

// Wrap with Suspense:
<React.Suspense fallback={<div>Loading...</div>}>
  <DataSection />
</React.Suspense>
Use code with caution.
TypeScript
Minification: Ensure that your production build minifies JavaScript and CSS. This should be automatic with Create React App, but verify.

Tree Shaking: Webpack should automatically remove unused code. Verify by inspecting the output bundle.

Image Optimization:
- As previously stated, ensure all images are compressed and in the correct format.

Lazy Loading:

Lazy load images that are not initially visible to the user using the loading="lazy" HTML attribute, or through use with IntersectionObserver.

Performance Audits:

Regularly run performance audits with Lighthouse to identify areas for optimization.