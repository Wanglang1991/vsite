'use client';

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import type Player from 'video.js/dist/types/player';

export default function VideoPlayer({ src, poster, onReady }: {
  src: string;
  poster?: string;
  onReady?: (player: Player) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      fluid: true,
      aspectRatio: '16:9',
      poster,
      sources: [{ src, type: 'video/mp4' }],
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
    });

    playerRef.current = player;
    onReady?.(player);

    return () => {
      player.dispose();
    };
  }, [src, poster]);

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered" />
      </div>
    </div>
  );
}