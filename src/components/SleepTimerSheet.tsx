import React, { useState } from 'react';
import { Moon, X, Music } from 'lucide-react';
import { formatDuration } from '../utils/musicLogic';

interface SleepTimerSheetProps {
  remainingMs: number | null;
  isEndOfSong: boolean;
  onStartTimer: (minutes: number) => void;
  onStartEndOfSong: () => void;
  onAdjustTimer: (additionalMinutes: number) => void;
  onCancelTimer: () => void;
  onDismiss: () => void;
}

export const SleepTimerSheet: React.FC<SleepTimerSheetProps> = ({
  remainingMs,
  isEndOfSong,
  onStartTimer,
  onStartEndOfSong,
  onAdjustTimer,
  onCancelTimer,
  onDismiss,
}) => {
  const [customMinutes, setCustomMinutes] = useState(20);
  const isActive = remainingMs !== null || isEndOfSong;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sleep Timer"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-6 space-y-5 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)]">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Sleep Timer</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Auto pause music when sleeping
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close Sleep Timer"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isActive ? (
          <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 text-center space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider text-[var(--text-muted)]">
                ACTIVE SLEEP TIMER
              </p>
              <div className="text-3xl font-bold font-mono tabular-nums text-[var(--text-primary)]">
                {isEndOfSong
                  ? 'End of Track'
                  : formatDuration(Math.max(0, remainingMs || 0))}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {isEndOfSong
                  ? 'Playback will pause gently when the current song finishes'
                  : 'Remaining before playback automatically pauses'}
              </p>
            </div>

            {!isEndOfSong && (
              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onAdjustTimer(-5)}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  -5 min
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustTimer(5)}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  +5 min
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustTimer(15)}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  +15 min
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                onCancelTimer();
                onDismiss();
              }}
              className="w-full py-2.5 rounded-xl border border-red-500/50 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors"
            >
              Turn Off Timer
            </button>
          </div>
        ) : (
          <>
            {/* Quick Presets */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold tracking-wider text-[var(--text-muted)]">
                QUICK PRESETS
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      onStartTimer(mins);
                      onDismiss();
                    }}
                    className="py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--text-primary)] transition-colors flex flex-col items-center justify-center"
                  >
                    <span className="text-base font-bold font-mono tabular-nums text-[var(--text-primary)]">
                      {mins}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">min</span>
                  </button>
                ))}
              </div>

              {/* End of current song preset */}
              <button
                type="button"
                onClick={() => {
                  onStartEndOfSong();
                  onDismiss();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--text-primary)] transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                  <Music className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    End of current song
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Pauses gently when the active track finishes
                  </div>
                </div>
              </button>
            </div>

            {/* Custom Duration Slider */}
            <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Custom Duration
                </span>
                <span className="text-sm font-bold font-mono tabular-nums text-[var(--text-primary)]">
                  {customMinutes} min
                </span>
              </div>

              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                aria-label="Custom sleep timer duration in minutes"
                className="w-full accent-[var(--text-primary)] cursor-pointer"
              />

              <button
                type="button"
                onClick={() => {
                  onStartTimer(customMinutes);
                  onDismiss();
                }}
                className="w-full py-2.5 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Start {customMinutes} Min Timer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
