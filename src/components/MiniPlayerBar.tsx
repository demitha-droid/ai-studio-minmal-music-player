import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Moon, X } from 'lucide-react';
import { PlaybackState } from '../types/music';
import { calculateProgress, formatDuration } from '../utils/musicLogic';
import { MinimalArtwork } from './MinimalComponents';

interface MiniPlayerBarProps {
  playbackState: PlaybackState;
  onPlayPauseClick: () => void;
  onNextClick: () => void;
  onPreviousClick: () => void;
  onExpandClick: () => void;
  onDismiss: () => void;
  sleepTimerRemainingMs: number | null;
  isSleepTimerEndOfSong: boolean;
}

export const MiniPlayerBar: React.FC<MiniPlayerBarProps> = ({
  playbackState,
  onPlayPauseClick,
  onNextClick,
  onPreviousClick,
  onExpandClick,
  onDismiss,
  sleepTimerRemainingMs,
  isSleepTimerEndOfSong,
}) => {
  const song = playbackState.currentSong;
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (!song) return null;

  const progress = calculateProgress(
    playbackState.currentPositionMs,
    playbackState.durationMs
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (deltaX <= -50) {
      onNextClick();
    } else if (deltaX >= 50) {
      onPreviousClick();
    }
    setTouchStartX(null);
  };

  return (
    <div
      data-testid="mini-player-bar"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden transition-all"
    >
      {/* Top 2px linear progress bar */}
      <div className="w-full h-[2px] bg-transparent overflow-hidden">
        <div
          className="h-full bg-[var(--text-primary)] transition-all duration-150"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
        {/* Tap area to open full Now Playing sheet */}
        <button
          type="button"
          onClick={onExpandClick}
          aria-label={`Open Now Playing for ${song.title}`}
          className="flex items-center gap-3 flex-1 min-w-0 text-left focus:outline-none group"
        >
          <MinimalArtwork
            title={song.title}
            size={42}
            radius={9}
            artworkUri={song.artworkUri}
          />

          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-[var(--text-primary)] truncate group-hover:underline">
              {song.title}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] truncate">
              <span className="truncate">{song.artist}</span>
              <span aria-hidden="true" className="text-[var(--text-muted)]">
                ·
              </span>
              <span className="font-mono tabular-nums text-[11px] text-[var(--text-muted)]">
                {formatDuration(playbackState.currentPositionMs)} /{' '}
                {formatDuration(playbackState.durationMs)}
              </span>
              {(sleepTimerRemainingMs !== null || isSleepTimerEndOfSong) && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono tabular-nums text-[var(--text-primary)]">
                  <Moon className="w-3 h-3" />
                  {isSleepTimerEndOfSong
                    ? 'EOS'
                    : `${Math.max(1, Math.ceil((sleepTimerRemainingMs || 0) / 60000))}m`}
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onPreviousClick}
            aria-label="Previous Track"
            className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onPlayPauseClick}
            aria-label={playbackState.isPlaying ? 'Pause' : 'Play'}
            className="w-10 h-10 rounded-full bg-[var(--accent-primary)] text-[var(--accent-contrast)] flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
          >
            {playbackState.isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onNextClick}
            aria-label="Next Track"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss Mini Player"
            title="Dismiss Mini Player"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
