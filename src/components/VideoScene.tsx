import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import videoFrame from '../assets/images/video_frame.png';
import '../styles/VideoScene.css';

gsap.registerPlugin(ScrollTrigger);

interface VideoSceneProps {
  isReadyToPlay?: boolean;
}

const VideoScene: React.FC<VideoSceneProps> = ({ isReadyToPlay = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Timeline für die Eingangs-Animation
  useEffect(() => {
    if (!containerRef.current || !frameRef.current || !videoRef.current) return;

    // Timeline erstellen
    timelineRef.current = gsap.timeline({ paused: true })
      .set([frameRef.current, videoRef.current], {
        opacity: 0,
        scale: 0.8,
        y: 50
      })
      .to([frameRef.current, videoRef.current], {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.1
      });

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  // ScrollTrigger und Video-Kontrolle
  useEffect(() => {
    if (!containerRef.current || !timelineRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        if (isReadyToPlay && timelineRef.current && !isVideoPlaying) {
          timelineRef.current.play();
          setIsVideoPlaying(true);
        }
      },
      onLeave: () => {
        if (timelineRef.current && isVideoPlaying) {
          timelineRef.current.reverse();
          setIsVideoPlaying(false);
        }
      },
      onEnterBack: () => {
        if (isReadyToPlay && timelineRef.current && !isVideoPlaying) {
          timelineRef.current.play();
          setIsVideoPlaying(true);
        }
      },
      onLeaveBack: () => {
        if (timelineRef.current && isVideoPlaying) {
          timelineRef.current.reverse();
          setIsVideoPlaying(false);
        }
      }
    });

    // Wenn wir direkt auf der Szene landen und bereit zum Abspielen sind
    if (trigger.isActive && isReadyToPlay && !isVideoPlaying) {
      timelineRef.current.play();
      setIsVideoPlaying(true);
    }

    return () => {
      trigger.kill();
    };
  }, [isReadyToPlay, isVideoPlaying]);

  return (
    <div id="video-scene" className="video-scene" ref={containerRef}>
      <div className="frame-container">
        <iframe
          ref={videoRef}
          src={isVideoPlaying ? "https://streamable.com/e/8m3e1s?autoplay=1&nocontrols=1" : "about:blank"}
          className="video-embed"
          allow="autoplay"
          title="Streamable Video"
          frameBorder="0"
        />
        <img 
          ref={frameRef}
          src={videoFrame} 
          alt="Video Frame" 
          className="video-frame"
        />
      </div>
    </div>
  );
};

export default VideoScene; 