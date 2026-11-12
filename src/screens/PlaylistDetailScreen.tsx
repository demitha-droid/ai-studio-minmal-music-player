import React from 'react';
import { ArrowLeft, Play, Shuffle } from 'lucide-react';
import { Song } from '../types/music';
import { SongListItem } from '../components/MinimalComponents';

interface PlaylistDetailScreenProps {
  title: string;
  playlistId: number | null;
  songs: Song[];
  currentSongId: number | null;
  isPlaying: boolean;
  onBack: () => void;
  onPlayQueue: (songs: Song[], startIndex?: number) => void;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onToggleFavorite: (song: Song) => void;
  onRemoveFromPlaylist?: (playlistId: number, songId: number) => void;
  onFetchArtwork: (song: Song) => void;
}

export const PlaylistDetailScreen: React.FC<PlaylistDetailScreenProps> = ({
  title,
  playlistId,
  songs,
  currentSongId,
  isPlaying,
  onBack,
  onPlayQueue,
  onPlaySong,
  onToggleFavorite,
  onRemoveFromPlaylist,
  onFetchArtwork,
}) => {
  return (
    <div className="space-y-5 pb-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Playlists"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
            {title}
          </h1>
          <p className="text-xs font-mono tabular-nums text-[var(--text-muted)]">
            {songs.length} tracks
          </p>
        </div>
      </div>

      {/* Play All & Shuffle Buttons */}
      {songs.length > 0 && (
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => onPlayQueue(songs, 0)}
            className="h-10 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-xs font-bold inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play All</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const shuffled = [...songs].sort(() => Math.random() - 0.5);
              onPlayQueue(shuffled, 0);
            }}
            className="h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
          </button>
        </div>
      )}

      {songs.length === 0 ? (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">
          No tracks in this playlist yet
        </div>
      ) : (
        <div className="space-y-1">
          {songs.map((song) => (
            <SongListItem
              key={song.id}
              song={song}
              isPlaying={isPlaying}
              isCurrentSong={currentSongId === song.id}
              onSongClick={() => onPlaySong(song, songs)}
              onFavoriteToggle={() => onToggleFavorite(song)}
              onRemoveFromPlaylistClick={
                playlistId !== null && onRemoveFromPlaylist
                  ? () => onRemoveFromPlaylist(playlistId, song.id)
                  : undefined
              }
              onFetchArtwork={() => onFetchArtwork(song)}
              showPlayCount={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
