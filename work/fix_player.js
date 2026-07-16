const fs = require("fs");
const base = "C:/Users/Administrator/Documents/Codex/2026-07-16/new-chat/packages/web/src/components";

const videoPlayer = `'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import type Player from 'video.js/dist/types/player';
import type { VideoQuality } from '@/types';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  qualities?: VideoQuality[];
  onReady?: (player: Player) => void;
}

export default function VideoPlayer({ src, poster, qualities, onReady }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [currentQuality, setCurrentQuality] = useState<string>('');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const sources = qualities && qualities.length > 0
    ? qualities.map(q => ({ src: q.src, type: 'video/mp4', label: q.label }))
    : [{ src, type: 'video/mp4' as const, label: 'auto' }];

  useEffect(() => {
    if (!videoRef.current) return;
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    const player = videojs(videoRef.current, {
      controls: true,
      fluid: true,
      aspectRatio: '16:9',
      poster,
      sources,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      preload: 'auto',
      html5: {
        vhs: {
          overrideNative: true,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
    });

    // Apply buffer settings for slow networks
    player.ready(() => {
      const tech = player.tech() as any;
      if (tech && tech.vhs) {
        tech.vhs.bufferBasedABR = true;
      }
    });

    playerRef.current = player;
    if (sources.length > 1) setCurrentQuality(sources[0].label || 'auto');
    onReady?.(player);

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster]);

  const switchQuality = useCallback((quality: VideoQuality | null) => {
    const player = playerRef.current;
    if (!player) return;

    const currentTime = player.currentTime();
    const wasPlaying = !player.paused();

    if (quality) {
      player.src({ src: quality.src, type: 'video/mp4' });
      setCurrentQuality(quality.label);
    } else {
      // Reset to all sources (auto)
      player.src(sources);
      setCurrentQuality(sources[0]?.label || 'auto');
    }

    player.one('loadedmetadata', () => {
      player.currentTime(currentTime);
      if (wasPlaying) player.play();
    });

    setShowQualityMenu(false);
  }, [sources]);

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden relative group">
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered" />
      </div>

      {/* Quality selector overlay */}
      {qualities && qualities.length > 1 && (
        <div className="absolute bottom-12 right-3 z-10">
          <button
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className="px-2 py-1 bg-black/70 hover:bg-black/90 text-white text-xs rounded transition opacity-0 group-hover:opacity-100"
          >
            {currentQuality || 'auto'}
          </button>

          {showQualityMenu && (
            <div className="absolute bottom-full right-0 mb-1 bg-black/90 border border-white/10 rounded-lg overflow-hidden shadow-xl">
              <button
                onClick={() => switchQuality(null)}
                className={'block w-full px-3 py-1.5 text-xs text-left hover:bg-white/10 transition ' + (!currentQuality || currentQuality === 'auto' ? 'text-brand-blue' : 'text-white')}
              >
                auto
              </button>
              {qualities.map(q => (
                <button
                  key={q.label}
                  onClick={() => switchQuality(q)}
                  className={'block w-full px-3 py-1.5 text-xs text-left hover:bg-white/10 transition ' + (currentQuality === q.label ? 'text-brand-blue' : 'text-white')}
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync(base + "/VideoPlayer.tsx", videoPlayer);
console.log("VideoPlayer updated");