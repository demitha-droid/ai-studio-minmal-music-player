import React, { useState } from 'react';
import {
  Plus,
  Heart,
  Flame,
  Star,
  ListMusic,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { Playlist, Song } from '../types/music';

interface PlaylistsScreenProps {
  playlists: Playlist[];
  favorites: Song[];
  mostPlayed: Song[];
  mostPopular: Song[];
  onOpenSmartPlaylist: (name: 'Favorites' | 'Most Played' | 'Most Popular') => void;
  onOpenCustomPlaylist: (playlist: Playlist) => void;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (id: number) => void;
}

export const PlaylistsScreen: React.FC<PlaylistsScreenProps> = React.memo(({
  playlists,
  favorites,
  mostPlayed,
  mostPopular,
  onOpenSmartPlaylist,
  onOpenCustomPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-7 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Playlists
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Smart mixes &amp; your collections
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreateDialog(true)}
            aria-label="Create Playlist"
            className="w-9 h-9 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Create Playlist Modal */}
      {showCreateDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="New Playlist"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowCreateDialog(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateSubmit}
            className="w-full max-w-sm rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 space-y-4 shadow-2xl"
          >
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              New Playlist
            </h2>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name"
              aria-label="Playlist name"
              autoFocus
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-primary)]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-xs font-bold"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Smart Mixes Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
          Smart Mixes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onOpenSmartPlaylist('Favorites')}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 fill-[var(--text-primary)] text-[var(--text-primary)]" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                Favorites
              </div>
              <div className="text-xs text-[var(--text-muted)] truncate">
                {favorites.length} songs loved by you
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onOpenSmartPlaylist('Most Played')}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                Most Played
              </div>
              <div className="text-xs text-[var(--text-muted)] truncate">
                {mostPlayed.length} tracks on repeat
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onOpenSmartPlaylist('Most Popular')}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-colors text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                Most Popular Hits
              </div>
              <div className="text-xs text-[var(--text-muted)] truncate">
                {mostPopular.length} trending top charts
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Custom Playlists Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
          My Playlists ({playlists.length})
        </h2>

        {playlists.length === 0 ? (
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 text-center text-sm text-[var(--text-muted)]">
            Tap + above to create your first playlist
          </div>
        ) : (
          <div className="space-y-1.5">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl hover:bg-[var(--bg-elevated)]/60 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onOpenCustomPlaylist(playlist)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left focus:outline-none"
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                    <ListMusic className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {playlist.name}
                    </div>
                    <div className="text-xs font-mono tabular-nums text-[var(--text-muted)]">
                      {playlist.songIds.length} tracks
                    </div>
                  </div>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId((prev) => (prev === playlist.id ? null : playlist.id))
                    }
                    aria-label={`Playlist options for ${playlist.name}`}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenuId === playlist.id && (
                    <div className="absolute right-0 mt-1 w-40 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-xl py-1 z-30">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onDeletePlaylist(playlist.id);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-red-400 hover:bg-[var(--bg-surface)] flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete playlist</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
});
