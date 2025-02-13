import { FC, useRef, useEffect, memo } from 'react';
import { useSceneState } from '../context/SceneContext';

interface VideoSceneProps {
    videoSource: string;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
}

const VideoScene: FC<VideoSceneProps> = memo(({
    videoSource,
    autoPlay = true,
    muted = false,
    loop = true
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { isActive = false } = useSceneState() ?? {};

    // Lazy loading des Videos mit loading="lazy"
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        // Preload-Strategie optimieren
        videoElement.preload = isActive ? 'auto' : 'none';

        if (isActive) {
            // Performance-Optimierung: Video nur abspielen wenn es im Viewport ist
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            videoElement.play().catch(error => {
                                console.error('Video konnte nicht abgespielt werden:', error);
                            });
                        } else {
                            videoElement.pause();
                        }
                    });
                },
                { threshold: 0.1 }
            );

            observer.observe(videoElement);
            return () => observer.disconnect();
        } else {
            videoElement.pause();
        }
    }, [isActive]);

    return (
        <div className="video-scene">
            <video
                ref={videoRef}
                src={videoSource}
                autoPlay={autoPlay}
                muted={muted}
                loop={loop}
                playsInline
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    willChange: 'transform' // Für bessere GPU-Beschleunigung
                }}
            />
        </div>
    );
}, (prevProps, nextProps) => {
    // Memoisierungs-Bedingungen
    return (
        prevProps.videoSource === nextProps.videoSource &&
        prevProps.autoPlay === nextProps.autoPlay &&
        prevProps.muted === nextProps.muted &&
        prevProps.loop === nextProps.loop
    );
});

export default VideoScene; 