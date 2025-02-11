import React, { createContext, useContext, useRef } from 'react';

interface SceneRefs {
  textRef: React.RefObject<HTMLDivElement | null>;
  comparisonRef: React.RefObject<HTMLDivElement | null>;
  filledRef: React.RefObject<SVGSVGElement | null>;
  equalsRef: React.RefObject<HTMLDivElement | null>;
  resultTextRef: React.RefObject<HTMLDivElement | null>;
  tub1Ref: React.RefObject<SVGSVGElement | null>;
  tub2Ref: React.RefObject<SVGSVGElement | null>;
  tub3Ref: React.RefObject<SVGSVGElement | null>;
}

const SceneRefsContext = createContext<SceneRefs | null>(null);

export const useSceneRefs = () => {
  const context = useContext(SceneRefsContext);
  if (!context) {
    throw new Error('useSceneRefs must be used within a SceneRefsProvider');
  }
  return context;
};

export const SceneRefsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const filledRef = useRef<SVGSVGElement>(null);
  const equalsRef = useRef<HTMLDivElement>(null);
  const resultTextRef = useRef<HTMLDivElement>(null);
  const tub1Ref = useRef<SVGSVGElement>(null);
  const tub2Ref = useRef<SVGSVGElement>(null);
  const tub3Ref = useRef<SVGSVGElement>(null);

  const refs: SceneRefs = {
    textRef,
    comparisonRef,
    filledRef,
    equalsRef,
    resultTextRef,
    tub1Ref,
    tub2Ref,
    tub3Ref
  };

  return (
    <SceneRefsContext.Provider value={refs}>
      {children}
    </SceneRefsContext.Provider>
  );
};

export default SceneRefsContext; 