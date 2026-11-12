import React from 'react';
import { X, RefreshCw, Download, FileText, Moon, Contrast, Sun } from 'lucide-react';
import { ThemeMode, THEME_LABELS } from '../types/music';

interface SettingsSheetProps {
  openLyricsByDefault: boolean;
  onToggleOpenLyricsByDefault: (val: boolean) => void;
  themeMode: ThemeMode;
  onSelectThemeMode: (mode: ThemeMode) => void;
  totalSongsCount: number;
  onRescanAudio: () => void;
  onFetchAllArtwork: () => void;
  onDismiss: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  openLyricsByDefault,
  onToggleOpenLyricsByDefault,
  themeMode,
  onSelectThemeMode,
  totalSongsCount,
  onRescanAudio,
  onFetchAllArtwork,
  onDismiss,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-[var(--text-muted)]">
              SETTINGS
            </p>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Preferences</h2>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close Settings"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section: Lyrics */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold tracking-wider text-[var(--text-muted)]">
            LYRICS
          </p>

          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3.5">
              <FileText className="w-6 h-6 text-[var(--text-primary)] shrink-0" />
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Open Lyrics by Default
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  Show lyrics immediately when expanding the player instead of the disc
                </div>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={openLyricsByDefault}
              aria-label="Open Lyrics by Default"
              onClick={() => onToggleOpenLyricsByDefault(!openLyricsByDefault)}
              className={`w-12 h-7 rounded-full transition-colors p-1 shrink-0 ${
                openLyricsByDefault
                  ? 'bg-[var(--accent-primary)]'
                  : 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full transition-transform ${
                  openLyricsByDefault
                    ? 'translate-x-5 bg-[var(--accent-contrast)]'
                    : 'translate-x-0 bg-[var(--text-muted)]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section: Appearance */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold tracking-wider text-[var(--text-muted)]">
            APPEARANCE
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {(['DARK', 'AMOLED', 'LIGHT'] as ThemeMode[]).map((mode) => {
              const isSelected = mode === themeMode;
              const Icon = mode === 'DARK' ? Moon : mode === 'AMOLED' ? Contrast : Sun;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onSelectThemeMode(mode)}
                  className={`flex flex-col items-center justify-center gap-2 py-3.5 px-2 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-[var(--bg-elevated)] border-[var(--text-primary)] text-[var(--text-primary)] font-bold'
                      : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs text-center">{THEME_LABELS[mode]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Library & Artwork */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold tracking-wider text-[var(--text-muted)]">
            LIBRARY & ARTWORK
          </p>

          <button
            type="button"
            onClick={() => {
              onRescanAudio();
              onDismiss();
            }}
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors text-left"
          >
            <RefreshCw className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Rescan Device Audio
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Re-indexes local audio files and refreshes folder counts
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onFetchAllArtwork();
              onDismiss();
            }}
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors text-left"
          >
            <Download className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Fetch YouTube Pictures
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Downloads high-res cover art for all tracks ({totalSongsCount} songs)
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
