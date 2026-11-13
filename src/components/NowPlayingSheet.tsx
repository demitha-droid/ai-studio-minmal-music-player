import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Heart,
  Settings,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Moon,
  Disc,
  ListMusic,
} from 'lucide-react';
import { ParsedLyrics, PlaybackState, Song } from '../types/music';
import { calculateProgress, formatDuration } from '../utils/musicLogic';
import { LyricsView } from './LyricsView';
import { EqualizerIndicator, MinimalArtwork } from './MinimalComponents';

type CenterPanelMode = 'disc' | 'lyrics' | 'queue';

interface NowPlayingSheetProps {
  playbackState: PlaybackState;
  isFavorite: boolean;
  openLyricsByDefault: boolean;
  currentLyrics: string | null | undefined;
  isLoadingLyrics: boolean;
  parsedLyrics: ParsedLyrics;
  sleepTimerRemainingMs: number | null;
  isSleepTimerEndOfSong: boolean;
  onTogglePlayPause: () => void;
  onSkipNext: () => void;
  onSkipPrevious: (force?: boolean) => void;
  onSeekTo: (ms: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: (song: Song) => void;
  onFetchArtwork: (song: Song) => void;
  onRetryLyrics: () => void;
  onSelectQueueIndex?: (index: number) => void;
  onOpenSleepTimer: () => void;
  onOpenSettings: () => void;
  onDismiss: () => void;
}

export const NowPlayingSheet: React.FC<NowPlayingSheetProps> = ({
  playbackState,
  isFavorite,
  openLyricsByDefault,
  currentLyrics,
  isLoadingLyrics,
  parsedLyrics,
  sleepTimerRemainingMs,
  isSleepTimerEndOfSong,
  onTogglePlayPause,
  onSkipNext,
  onSkipPrevious,
  onSeekTo,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  onFetchArtwork,
  onRetryLyrics,
  onSelectQueueIndex,
  onOpenSleepTimer,
  onOpenSettings,
  onDismiss,
}) => {
  const song = playbackState.currentSong;
  const [centerMode, setCenterMode] = useState<CenterPanelMode>(
    openLyricsByDefault ? 'lyrics' : 'disc'
  );
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  const [seekRatio, setSeekRatio] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setCenterMode(openLyricsByDefault ? 'lyrics' : 'disc');
  }, [openLyricsByDefault]);

  if (!song) return null;

  const showLyrics = centerMode === 'lyrics';
  const showQueue = centerMode === 'queue';

  const progress = isUserSeeking
    ? seekRatio
    : calculateProgress(playbackState.currentPositionMs, playbackState.durationMs);

  const displayedPositionMs = isUserSeeking
    ? Math.round(seekRatio * playbackState.durationMs)
    : playbackState.currentPositionMs;

  const isTimerActive = sleepTimerRemainingMs !== null || isSleepTimerEndOfSong;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (centerMode !== 'disc') return;
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (centerMode !== 'disc' || touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (delta <= -60) {
      onSkipNext();
    } else if (delta >= 60) {
      onSkipPrevious(true);
    }
    setTouchStartX(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Now Playing"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--bg-canvas)] sm:bg-black/75 sm:backdrop-blur-md p-0 sm:p-6 overflow-y-auto"
    >
      <div className="w-full h-full sm:h-auto sm:max-w-lg sm:rounded-3xl bg-[var(--bg-canvas)] sm:border border-[var(--border-subtle)] px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:py-5 flex flex-col justify-between shadow-2xl">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Collapse Now Playing"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          <span className="text-xs font-bold tracking-[0.2em] text-[var(--text-muted)]">
            NOW PLAYING
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCenterMode((m) => (m === 'lyrics' ? 'disc' : 'lyrics'))}
              aria-label={showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}
              title={showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                showLyrics
                  ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <FileText className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setCenterMode((m) => (m === 'queue' ? 'disc' : 'queue'))}
              aria-label={showQueue ? 'Hide Queue' : 'Show Up Next Queue'}
              title={showQueue ? 'Hide Queue' : 'Show Up Next Queue'}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                showQueue
                  ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ListMusic className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => onFetchArtwork(song)}
              aria-label="Fetch YouTube Thumbnail"
              title="Fetch YouTube Thumbnail"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => onToggleFavorite(song)}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite
                    ? 'fill-[var(--text-primary)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)]'
                }`}
              />
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="Player Settings"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Disc / Synced Lyrics / Up Next Queue Area */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="my-5 flex flex-col items-center w-full"
        >
          {showLyrics ? (
            <LyricsView
              rawLyrics={currentLyrics}
              isLoading={isLoadingLyrics}
              currentPositionMs={playbackState.currentPositionMs}
              parsedLyrics={parsedLyrics}
              onSeekTo={onSeekTo}
              onRetry={onRetryLyrics}
              className="w-full h-[270px]"
            />
          ) : showQueue ? (
            <div className="w-full h-[270px] rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3 overflow-y-auto space-y-1">
              <div className="flex items-center justify-between px-2 pb-1.5 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  Up Next Queue
                </span>
                <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)]">
                  {playbackState.queue.length} tracks
                </span>
              </div>
              {playbackState.queue.map((qSong, idx) => {
                const isActive = idx === playbackState.queueIndex;
                return (
                  <button
                    key={`${qSong.id}_${idx}`}
                    type="button"
                    onClick={() => onSelectQueueIndex?.(idx)}
                    className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors ${
                      isActive
                        ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold'
                        : 'hover:bg-[var(--bg-elevated)]/50 text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)] w-5 shrink-0">
                        {idx + 1}
                      </span>
                      <MinimalArtwork
                        title={qSong.title}
                        size={32}
                        radius={7}
                        artworkUri={qSong.artworkUri}
                      />
                      <div className="min-w-0">
                        <div className="text-xs text-[var(--text-primary)] truncate">
                          {qSong.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] truncate">
                          {qSong.artist}
                        </div>
                      </div>
                    </div>
                    {isActive && playbackState.isPlaying ? (
                      <EqualizerIndicator />
                    ) : (
                      <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)] shrink-0">
                        {formatDuration(qSong.durationMs)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="relative w-60 h-60 sm:w-64 sm:h-64 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shadow-inner">
              <div
                className={`w-full h-full rounded-full flex items-center justify-center ${
                  playbackState.isPlaying ? 'animate-vinyl' : ''
                }`}
              >
                {/* Outer Vinyl Groove Rings */}
                <div className="absolute inset-4 rounded-full border border-[var(--border-subtle)]/60 pointer-events-none" />
                <div className="absolute inset-9 rounded-full border border-[var(--border-subtle)]/40 pointer-events-none" />
                <div className="absolute inset-14 rounded-full border border-[var(--border-subtle)]/30 pointer-events-none" />

                {/* Center Album Label */}
                <MinimalArtwork
                  title={song.title}
                  size={104}
                  radius={52}
                  artworkUri={song.artworkUri}
                  isVinylCenter
                />

                {/* Center Spindle Hole */}
                <div className="absolute w-3.5 h-3.5 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] shadow-inner" />
              </div>
            </div>
          )}

          {/* Track Title, Artist & View Switch Buttons */}
          <div className="mt-5 text-center space-y-1.5 w-full">
            <h2 className="text-xl font-bold text-[var(--text-primary)] truncate px-4">
              {song.title}
            </h2>
            <p className="text-sm font-medium text-[var(--text-secondary)] truncate px-4">
              {song.artist}
              {song.album ? ` · ${song.album}` : ''}
            </p>

            <div className="pt-1.5 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setCenterMode((m) => (m === 'lyrics' ? 'disc' : 'lyrics'))}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                  showLyrics
                    ? 'bg-[var(--bg-surface)] border-[var(--text-primary)] text-[var(--text-primary)]'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {showLyrics ? (
                  <>
                    <Disc className="w-3.5 h-3.5" />
                    <span>Show Disc</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Show Lyrics</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCenterMode((m) => (m === 'queue' ? 'disc' : 'queue'))}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                  showQueue
                    ? 'bg-[var(--bg-surface)] border-[var(--text-primary)] text-[var(--text-primary)]'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <ListMusic className="w-3.5 h-3.5" />
                <span>Queue ({playbackState.queue.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrub Bar & Tabular Timestamps */}
        <div className="w-full space-y-1.5">
          <input
            type="range"
            min={0}
            max={1}
            step={0.002}
            value={progress}
            aria-label="Seek track position"
            onChange={(e) => {
              setIsUserSeeking(true);
              setSeekRatio(Number(e.target.value));
            }}
            onMouseUp={() => {
              onSeekTo(Math.round(seekRatio * playbackState.durationMs));
              setIsUserSeeking(false);
            }}
            onTouchEnd={() => {
              onSeekTo(Math.round(seekRatio * playbackState.durationMs));
              setIsUserSeeking(false);
            }}
            className="w-full accent-[var(--text-primary)] cursor-pointer h-1.5 rounded-lg"
          />

          <div className="flex items-center justify-between text-xs font-mono tabular-nums text-[var(--text-muted)]">
            <span>{formatDuration(displayedPositionMs)}</span>
            <span>{formatDuration(playbackState.durationMs)}</span>
          </div>
        </div>

        {/* Primary Playback Controls */}
        <div className="flex items-center justify-between w-full my-3">
          <button
            type="button"
            onClick={onToggleShuffle}
            aria-label="Toggle Shuffle"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              playbackState.isShuffle
                ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onSkipPrevious(false)}
            aria-label="Previous"
            className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <SkipBack className="w-7 h-7" />
          </button>

          <button
            type="button"
            onClick={onTogglePlayPause}
            aria-label={playbackState.isPlaying ? 'Pause' : 'Play'}
            className="w-16 h-16 rounded-full bg-[var(--accent-primary)] text-[var(--accent-contrast)] flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            {playbackState.isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={onSkipNext}
            aria-label="Next"
            className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <SkipForward className="w-7 h-7" />
          </button>

          <button
            type="button"
            onClick={onToggleRepeat}
            aria-label={`Repeat Mode: ${playbackState.repeatMode}`}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              playbackState.repeatMode !== 'OFF'
                ? 'text-[var(--text-primary)] bg-[var(--bg-elevated)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {playbackState.repeatMode === 'ONE' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Bottom Action Row: Sleep Timer & Queue Index */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onOpenSleepTimer}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs transition-colors ${
              isTimerActive
                ? 'bg-[var(--bg-surface)] border-[var(--text-primary)] text-[var(--text-primary)] font-bold'
                : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span className="font-mono tabular-nums">
              {isSleepTimerEndOfSong
                ? 'End of Song'
                : sleepTimerRemainingMs !== null
                  ? `${formatDuration(sleepTimerRemainingMs)} remaining`
                  : 'Sleep Timer'}
            </span>
          </button>

          {playbackState.queue.length > 0 && (
            <span className="text-xs font-mono tabular-nums text-[var(--text-muted)]">
              {playbackState.queueIndex + 1} / {playbackState.queue.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
