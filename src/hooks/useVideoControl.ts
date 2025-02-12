import { useState, useEffect, RefObject, useCallback } from 'react';

interface VideoControlProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  isReadyToPlay: boolean;
  onComplete: () => void;
}

export const useVideoControl = ({
  videoRef,
  isReadyToPlay,
  onComplete
}: VideoControlProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handlePlay = useCallback(() => {
    if (videoRef.current && isLoaded && isReadyToPlay) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => console.error('Video playback failed:', error));
    }
  }, [isLoaded, isReadyToPlay]);

  const handlePause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleLoadedData = () => {
    setIsLoaded(true);
    if (isReadyToPlay) {
      handlePlay();
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onComplete();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isReadyToPlay && isLoaded) {
      handlePlay();
    } else {
      handlePause();
    }
  }, [isReadyToPlay, isLoaded, handlePlay, handlePause]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('pause', () => setIsPlaying(false));
    video.addEventListener('play', () => setIsPlaying(true));

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('pause', () => setIsPlaying(false));
      video.removeEventListener('play', () => setIsPlaying(true));
    };
  }, [videoRef, handleLoadedData, handleEnded]);

  return {
    isPlaying,
    isLoaded,
    handlePlay,
    handlePause,
    handleLoadedData,
    handleEnded
  };
}; 