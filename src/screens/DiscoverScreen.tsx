import React from 'react';
import {
  Play,
  Shuffle,
  TrendingUp,
  Flame,
  Settings,
} from 'lucide-react';
import { Song, ThemeMode } from '../types/music';
import {
  MinimalArtwork,
  SongListItem,
  ThemeSwitcherButton,
} from '../components/MinimalComponents';

interface DiscoverScreenProps {
  mostPopular: Song[];
  mostPlayed: Song[];
  allSongs: Song[];
  currentSongId: number | null;
  isPlaying: boolean;
  themeMode: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
  onOpenSettings: () => void;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onPlayQueue: (queue: Song[], startIndex?: number) => void;
  onToggleFavorite: (song: Song) => void;
  onAddToPlaylistClick: (song: Song) => void;
  onFetchArtwork: (song: Song) => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = React.memo(({
  mostPopular,
  mostPlayed,
  allSongs,
  currentSongId,
  isPlaying,
  themeMode,
  onSelectTheme,
  onOpenSettings,
  onPlaySong,
  onPlayQueue,
  onToggleFavorite,
  onAddToPlaylistClick,
  onFetchArtwork,
}) => {
  const hasSongs = allSongs.length > 0;

  const handlePlayAll = () => {
    if (mostPopular.length > 0) {
      onPlayQueue(mostPopular, 0);
    } else if (allSongs.length > 0) {
      onPlayQueue(allSongs, 0);
    }
  };

  const handleShuffleAll = () => {
    if (allSongs.length > 0) {
      const shuffled = [...allSongs].sort(() => Math.random() - 0.5);
      onPlayQueue(shuffled, 0);
    }
  };

  return (
    <div className="space-y-7 pb-8">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Discover
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Clean, distraction-free listening
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcherButton
            currentTheme={themeMode}
            onThemeSelect={onSelectTheme}
          />

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Quick-Play Card */}
      <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--text-secondary)]">
              {hasSongs ? 'VIBE OF THE DAY' : 'MUSIC LIBRARY'}
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] mt-0.5">
              {hasSongs ? 'Your Local Collection' : 'No Songs Added Yet'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {hasSongs
                ? `${allSongs.length} curated offline tracks · Synced LRC ready`
                : 'Add folders from the Explorer tab to begin enjoying music offline.'}
            </p>
          </div>

          {hasSongs && (
            <button
              type="button"
              onClick={handlePlayAll}
              aria-label="Quick Play All"
              className="w-12 h-12 rounded-full bg-[var(--accent-primary)] text-[var(--accent-contrast)] flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shrink-0"
            >
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </button>
          )}
        </div>

        {hasSongs && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handlePlayAll}
              className="px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-xs font-bold inline-flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play All</span>
            </button>

            <button
              type="button"
              onClick={handleShuffleAll}
              className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
          </div>
        )}
      </div>

      {/* Most Popular (Trending) Section */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--text-secondary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Most Popular Songs
            </h2>
          </div>
          <span className="text-xs font-mono tabular-nums text-[var(--text-muted)]">
            {mostPopular.length} tracks
          </span>
        </div>

        {mostPopular.length === 0 ? (
          <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 text-center text-sm text-[var(--text-muted)]">
            Add folders in Explorer tab to discover music
          </div>
        ) : (
          <div className="flex gap-3.5 overflow-x-auto pb-2 pt-0.5">
            {mostPopular.slice(0, 10).map((song, idx) => {
              const isCurrent = currentSongId === song.id;
              return (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => onPlaySong(song, mostPopular)}
                  className="group w-[138px] shrink-0 text-left rounded-2xl p-1.5 hover:bg-[var(--bg-elevated)] transition-colors focus:outline-none"
                >
                  <div className="relative">
                    <MinimalArtwork
                      title={song.title}
                      size={126}
                      radius={14}
                      artworkUri={song.artworkUri}
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-[10px] font-mono font-bold text-white tabular-nums">
                      #{idx + 1}
                    </span>
                  </div>
                  <div className="mt-2 px-0.5">
                    <div
                      className={`text-sm truncate ${
                        isCurrent
                          ? 'font-bold text-[var(--text-primary)] underline'
                          : 'font-medium text-[var(--text-primary)]'
                      }`}
                    >
                      {song.title}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] truncate">
                      {song.artist}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Most Played Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[var(--text-secondary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Most Played
            </h2>
          </div>
          <span className="text-xs text-[var(--text-muted)]">Personal listening stats</span>
        </div>

        {mostPlayed.length === 0 ? (
          <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 text-center text-sm text-[var(--text-muted)]">
            Play songs to build your personal stats
          </div>
        ) : (
          <div className="space-y-1">
            {mostPlayed.slice(0, 6).map((song) => (
              <SongListItem
                key={song.id}
                song={song}
                isPlaying={isPlaying}
                isCurrentSong={currentSongId === song.id}
                onSongClick={() => onPlaySong(song, mostPlayed)}
                onFavoriteToggle={() => onToggleFavorite(song)}
                onAddToPlaylistClick={() => onAddToPlaylistClick(song)}
                onFetchArtwork={() => onFetchArtwork(song)}
                showPlayCount={true}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
});
