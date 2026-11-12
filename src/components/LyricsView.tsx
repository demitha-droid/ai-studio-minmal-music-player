import React, { useEffect, useRef } from 'react';
import { RefreshCw, Music2 } from 'lucide-react';
import { ParsedLyrics } from '../types/music';
import { formatDuration, getCurrentLyricLineIndex } from '../utils/musicLogic';

interface LyricsViewProps {
  rawLyrics?: string | null;
  isLoading: boolean;
  currentPositionMs: number;
  parsedLyrics: ParsedLyrics;
  onSeekTo: (timeMs: number) => void;
  onRetry: () => void;
  className?: string;
}

export const LyricsView: React.FC<LyricsViewProps> = ({
  rawLyrics,
  isLoading,
  currentPositionMs,
  parsedLyrics,
  onSeekTo,
  onRetry,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeIndex = getCurrentLyricLineIndex(parsedLyrics, currentPositionMs);

  useEffect(() => {
    if (
      parsedLyrics.isSynced &&
      activeIndex >= 0 &&
      lineRefs.current[activeIndex] &&
      containerRef.current
    ) {
      const activeEl = lineRefs.current[activeIndex];
      const container = containerRef.current;
      if (activeEl) {
        const targetScroll =
          activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;
        container.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth',
        });
      }
    }
  }, [activeIndex, parsedLyrics.isSynced]);

  const statusText =
    isLoading && !rawLyrics
      ? 'Searching Lyrics'
      : parsedLyrics.isSynced
        ? 'Synced LRC · 450ms Vocal Lead'
        : !rawLyrics
          ? 'No Lyrics'
          : 'Plain Lyrics';

  return (
    <div
      className={`flex flex-col rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] overflow-hidden ${className}`}
    >
      {/* Header status row */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-subtle)]">
        <span className="text-[11px] font-semibold tracking-wider text-[var(--text-secondary)]">
          {statusText}
        </span>

        <button
          type="button"
          onClick={onRetry}
          aria-label="Refresh Lyrics"
          title="Refresh Lyrics from LRCLIB / Lyrics.ovh"
          className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Lyrics body */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-y-auto px-4 py-5 space-y-2.5 min-h-[240px] max-h-[300px]"
      >
        {isLoading && !rawLyrics ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <RefreshCw className="w-6 h-6 text-[var(--text-primary)] animate-spin" />
            <p className="text-xs text-[var(--text-muted)]">
              Downloading synced lyrics from LRCLIB...
            </p>
          </div>
        ) : !rawLyrics || parsedLyrics.lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <Music2 className="w-7 h-7 text-[var(--text-muted)]" />
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              No lyrics found online
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Search</span>
            </button>
          </div>
        ) : (
          parsedLyrics.lines.map((line, index) => {
            const isCurrent = parsedLyrics.isSynced && index === activeIndex;
            const isPast = parsedLyrics.isSynced && index < activeIndex;
            const canSeek = parsedLyrics.isSynced && line.timeMs >= 0;

            return (
              <button
                key={`${index}-${line.timeMs}`}
                ref={(el) => {
                  lineRefs.current[index] = el;
                }}
                type="button"
                disabled={!canSeek}
                onClick={() => {
                  if (canSeek) onSeekTo(line.timeMs);
                }}
                className={`w-full px-3 py-2 rounded-xl text-center transition-all flex items-center justify-between gap-2 ${
                  isCurrent
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold text-[16px] scale-[1.01]'
                    : isPast
                      ? 'text-[var(--text-secondary)]/60 text-[14px] hover:text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)] text-[14px] hover:text-[var(--text-secondary)]'
                } ${canSeek ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className="flex-1 text-center leading-snug">{line.text}</span>
                {canSeek && (
                  <span className="text-[10px] font-mono tabular-nums text-[var(--text-muted)] shrink-0">
                    {formatDuration(line.timeMs)}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
