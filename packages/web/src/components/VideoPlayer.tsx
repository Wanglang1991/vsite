'use client';

import { forwardRef, useRef, useState, useCallback, useEffect, useImperativeHandle } from 'react';
import type { VideoQuality } from '@/types';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

export interface VideoPlayerHandle {
  video: HTMLVideoElement | null;
}


interface VideoPlayerProps {
  onPlay?: () => void;
  src: string;
  poster?: string;
  qualities?: VideoQuality[];
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayer({ src, poster, qualities, onPlay }, ref) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useImperativeHandle(ref, () => ({
    get video() { return videoRef.current; },
  }));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const volumeRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [currentQuality, setCurrentQuality] = useState<string>('720p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const sortedQualities = qualities && qualities.length > 0
    ? [...qualities].sort((a, b) => b.height - a.height)
    : null;

  const defaultQuality = sortedQualities?.find(q => q.label === '720p') || sortedQualities?.[0];

  const activeSrc = sortedQualities
    ? (sortedQualities.find(q => q.label === currentQuality)?.src || defaultQuality?.src || sortedQualities[0].src)
    : src;

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.muted || v.volume === 0) {
      v.muted = false;
      v.volume = prevVolume || 1;
      setVolume(prevVolume || 1);
      setMuted(false);
    } else {
      setPrevVolume(v.volume);
      v.muted = true;
      setMuted(true);
    }
  }, [prevVolume]);

  const changeVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value);
    v.volume = val;
    v.muted = false;
    setVolume(val);
    setMuted(false);
    setPrevVolume(val);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, []);

  const switchQuality = useCallback((q: VideoQuality) => {
    const v = videoRef.current;
    if (!v) return;
    const ct = v.currentTime;
    const wasPlaying = !v.paused;
    setCurrentQuality(q.label);
    v.src = q.src;
    v.currentTime = ct;
    if (wasPlaying) v.play();
    setShowQualityMenu(false);
  }, []);

  const qualityRef = useRef<HTMLDivElement | null>(null);

  // Click outside to close volume slider
  useEffect(() => {
    if (!showVolumeSlider) return;
    const handler = (e: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setShowVolumeSlider(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showVolumeSlider]);

  // Click outside to close quality menu
  useEffect(() => {
    if (!showQualityMenu) return;
    const handler = (e: MouseEvent) => {
      if (qualityRef.current && !qualityRef.current.contains(e.target as Node)) {
        setShowQualityMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showQualityMenu]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
        setShowVolumeSlider(false);
        setShowQualityMenu(false);
      }
    }, 3000);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + sec.toString().padStart(2, '0');
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrentTime(v.currentTime);
    const onDur = () => setDuration(v.duration);
    const onPlayEvent = () => { setPlaying(true); onPlay?.(); };
    const onPause = () => { setPlaying(false); setShowControls(true); };
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onDur);
    v.addEventListener('play', onPlayEvent);
    v.addEventListener('pause', onPause);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onDur);
      v.removeEventListener('play', onPlayEvent);
      v.removeEventListener('pause', onPause);
    };
  }, [activeSrc]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-black rounded-lg relative group overflow-hidden"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => { if (playing) { clearTimeout(hideTimer.current); hideTimer.current = setTimeout(() => { setShowControls(false); setShowVolumeSlider(false); setShowQualityMenu(false); }, 1000); } }}
    >
      <video
        ref={videoRef}
        className="w-full aspect-video object-contain cursor-pointer"
        src={activeSrc}
        poster={poster}
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
        onClick={togglePlay}
      />

      {/* Center play button */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition"
        >
          <Play className="w-16 h-16 text-white/90 fill-white/90" />
        </button>
      )}

      {/* Controls bar */}
      <div className={'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-2 px-3 transition-opacity duration-300 ' + (showControls ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        {/* Progress bar */}
        <div
          className="w-full h-1 bg-white/30 rounded-full mb-2 cursor-pointer relative"
          onClick={seek}
        >
          <div className="absolute top-0 left-0 h-full bg-brand-pink rounded-full" style={{ width: duration ? (currentTime / duration) * 100 + '%' : '0%' }} />
        </div>

        {/* Controls row - gap 16px */}
        <div className="flex items-center gap-4">
          {/* Left: play/pause + time */}
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="h-5 flex items-center justify-center p-0 text-white/90 hover:text-white transition">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <span className="text-xs text-white/80 tabular-nums min-w-[70px]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex-1" />

          {/* Right: quality + volume + fullscreen */}
          <div className="flex items-center gap-4">
            {sortedQualities && sortedQualities.length > 1 && (
              <div ref={qualityRef} className="relative">
                <button
                  onClick={() => { setShowQualityMenu(!showQualityMenu); setShowVolumeSlider(false); }}
                  className="h-5 flex items-center text-white/90 hover:text-white text-xs rounded transition"
                >
                  {currentQuality || defaultQuality?.label || 'auto'}
                </button>
                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/95 border border-white/10 rounded-lg overflow-hidden shadow-xl min-w-[80px]">
                    {sortedQualities.map(q => (
                      <button
                        key={q.label}
                        onClick={() => switchQuality(q)}
                        className={'block w-full px-3 py-1.5 text-xs text-left hover:bg-white/10 transition ' + (currentQuality === q.label ? 'text-brand-pink' : 'text-white/80')}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div ref={volumeRef} className="relative">
              <button
                onClick={() => { setShowVolumeSlider(!showVolumeSlider); setShowQualityMenu(false); }}
                className="h-5 flex items-center justify-center p-0 text-white/90 hover:text-white transition"
              >
                {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              {showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-xl">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={muted ? 0 : volume}
                    onChange={changeVolume}
                    className="h-20 w-1 accent-brand-pink cursor-pointer"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  />
                </div>
              )}
            </div>

            <button onClick={toggleFullscreen} className="h-5 flex items-center justify-center p-0 text-white/90 hover:text-white transition">
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;
