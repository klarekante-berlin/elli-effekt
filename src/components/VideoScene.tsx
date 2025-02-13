import { FC, useRef, useEffect } from 'react';
import { useSceneState } from '../context/SceneContext';

interface VideoSceneProps {
    videoSource: string;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
}

const VideoScene: FC<VideoSceneProps> = ({
    videoSource,
    autoPlay = true,
    muted = true,
    loop = true
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { isActive = false } = useSceneState() ?? {};


    // Video-Steuerung basierend auf Scene-Status
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        if (isActive) {
            videoElement.play().catch(error => {
                console.error('Video konnte nicht abgespielt werden:', error);
            });
        } else {
            videoElement.pause();
        }

        return () => {
            if (videoElement && !videoElement.paused) {
                videoElement.pause();
            }
        };
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
                    objectFit: 'cover'
                }}
            />
        </div>
    );
};

export default VideoScene; 