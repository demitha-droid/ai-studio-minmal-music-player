import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  FolderPlus,
  RefreshCw,
  Download,
  Settings,
  FolderOpen,
  Folder as FolderIcon,
  Play,
  Shuffle,
  Check,
  MoreVertical,
  ArrowLeft,
  Image as ImageIcon,
  Music,
  ArrowUpDown,
} from 'lucide-react';
import { AddedFolder, Song, ThemeMode } from '../types/music';
import { getSongsForFolder } from '../utils/musicLogic';
import {
  FolderCoverImage,
  MinimalSearchBar,
  SongListItem,
  ThemeSwitcherButton,
} from '../components/MinimalComponents';

type SongsViewMode = 'folders' | 'tracks';
type TrackSortMode = 'popular' | 'title' | 'artist' | 'recent';

interface SongsScreenProps {
  allSongs: Song[];
  addedFolders: AddedFolder[];
  openedFolder: AddedFolder | null;
  searchQuery: string;
  currentSongId: number | null;
  isPlaying: boolean;
  themeMode: ThemeMode;
  onSearchQueryChange: (q: string) => void;
  onSelectTheme: (mode: ThemeMode) => void;
  onOpenFolder: (folder: AddedFolder) => void;
  onCloseFolder: () => void;
  onPlayFolder: (folder: AddedFolder, shuffle: boolean) => void;
  onConfirmFolderArtwork: (folderId: number) => void;
  onTryAgainFolderArtwork: (folder: AddedFolder) => void;
  onRefreshFolderArtwork: (folder: AddedFolder) => void;
  onRemoveFolder: (folder: AddedFolder) => void;
  onRescanDevice: () => void;
  onFetchAllThumbnails: (songs: Song[]) => void;
  onOpenSettings: () => void;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onToggleFavorite: (song: Song) => void;
  onAddToPlaylistClick: (song: Song) => void;
  onFetchSongArtwork: (song: Song) => void;
  onImportFiles: (files: FileList, folderName?: string) => void;
}

export const SongsScreen: React.FC<SongsScreenProps> = React.memo(({
  allSongs,
  addedFolders,
  openedFolder,
  searchQuery,
  currentSongId,
  isPlaying,
  themeMode,
  onSearchQueryChange,
  onSelectTheme,
  onOpenFolder,
  onCloseFolder,
  onPlayFolder,
  onConfirmFolderArtwork,
  onTryAgainFolderArtwork,
  onRefreshFolderArtwork,
  onRemoveFolder,
  onRescanDevice,
  onFetchAllThumbnails,
  onOpenSettings,
  onPlaySong,
  onToggleFavorite,
  onAddToPlaylistClick,
  onFetchSongArtwork,
  onImportFiles,
}) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<SongsViewMode>('folders');
  const [sortMode, setSortMode] = useState<TrackSortMode>('popular');

  const handleFolderPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const firstFile = e.target.files[0] as File & { webkitRelativePath?: string };
      const rel = firstFile.webkitRelativePath || '';
      const folderName = rel.split('/')[0] || 'Imported Folder';
      onImportFiles(e.target.files, folderName);
      e.target.value = '';
    }
  };

  // Precompute folder song counts once when allSongs or addedFolders changes
  const folderCountMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const folder of addedFolders) {
      const count = getSongsForFolder(allSongs, folder).length || folder.songCount;
      map.set(folder.id, count);
    }
    return map;
  }, [allSongs, addedFolders]);

  const openedFolderSongs = useMemo(() => {
    if (!openedFolder) return [];
    return getSongsForFolder(allSongs, openedFolder);
  }, [allSongs, openedFolder]);

  const sortedAllTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? allSongs.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.artist.toLowerCase().includes(q) ||
            s.album.toLowerCase().includes(q) ||
            (s.folderName || '').toLowerCase().includes(q)
        )
      : allSongs;

    const copy = [...filtered];
    if (sortMode === 'title') {
      copy.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === 'artist') {
      copy.sort((a, b) => a.artist.localeCompare(b.artist));
    } else if (sortMode === 'recent') {
      copy.sort((a, b) => b.dateAdded - a.dateAdded);
    } else {
      copy.sort((a, b) => b.playCount - a.playCount || b.popularityScore - a.popularityScore);
    }
    return copy;
  }, [allSongs, searchQuery, sortMode]);

  const filteredFolders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? addedFolders.filter((f) => f.name.toLowerCase().includes(q))
      : addedFolders;
  }, [addedFolders, searchQuery]);

  if (openedFolder) {
    const q = searchQuery.trim().toLowerCase();
    const displaySongs = q
      ? openedFolderSongs.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.artist.toLowerCase().includes(q)
        )
      : openedFolderSongs;

    return (
      <div className="space-y-4 pb-8 animate-tab-enter">
        {/* Top Bar with Back Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onCloseFolder}
              aria-label="Back to Folders"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-[var(--text-primary)] truncate">
                {openedFolder.name}
              </h1>
              <p className="text-xs font-mono tabular-nums text-[var(--text-muted)]">
                {openedFolderSongs.length} tracks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onFetchAllThumbnails(openedFolderSongs)}
              aria-label="Download YouTube pictures for folder"
              title="Download YouTube pictures for folder"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onRefreshFolderArtwork(openedFolder)}
              aria-label="Find web artwork"
              title="Find web artwork"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar inside folder */}
        <MinimalSearchBar
          query={searchQuery}
          onQueryChange={onSearchQueryChange}
          placeholderText={`Search songs in ${openedFolder.name}...`}
        />

        {/* Folder Header Banner */}
        <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 space-y-3.5">
          <div className="flex items-center gap-4">
            <FolderCoverImage
              artworkUri={openedFolder.artworkUri}
              folderName={openedFolder.name}
              size={88}
              radius={14}
            />
            <div className="flex-1 min-w-0 space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">
                {openedFolder.name}
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
                {openedFolderSongs.length} songs in folder
              </p>
              {openedFolder.artworkUri && openedFolder.isArtworkConfirmed && (
                <p className="text-[11px] font-medium text-[var(--text-secondary)]">
                  ✓ Album Cover Saved
                </p>
              )}
            </div>
          </div>

          {!openedFolder.isArtworkConfirmed && openedFolder.artworkUri && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onConfirmFolderArtwork(openedFolder.id)}
                className="h-9 rounded-full bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-xs font-bold inline-flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Keep Cover</span>
              </button>
              <button
                type="button"
                onClick={() => onTryAgainFolderArtwork(openedFolder)}
                className="h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Another</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onPlayFolder(openedFolder, false)}
              className="h-10 rounded-full bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-xs font-bold inline-flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play All</span>
            </button>
            <button
              type="button"
              onClick={() => onPlayFolder(openedFolder, true)}
              className="h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>

        {/* Folder Songs List */}
        {displaySongs.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--text-muted)]">
            {searchQuery.trim()
              ? `No songs match '${searchQuery}' in this folder`
              : `No audio files found in '${openedFolder.name}'`}
          </div>
        ) : (
          <div className="space-y-1">
            {displaySongs.map((song) => (
              <SongListItem
                key={song.id}
                song={song}
                isPlaying={isPlaying}
                isCurrentSong={currentSongId === song.id}
                onSongClick={() => onPlaySong(song, displaySongs)}
                onFavoriteToggle={() => onToggleFavorite(song)}
                onAddToPlaylistClick={() => onAddToPlaylistClick(song)}
                onFetchArtwork={() => onFetchSongArtwork(song)}
                showPlayCount={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={handleFolderPick}
        className="hidden"
      />

      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {viewMode === 'folders' ? 'Folders' : 'All Songs'}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {viewMode === 'folders'
              ? `${addedFolders.length} music folders · ${allSongs.length} tracks total`
              : `${allSongs.length} offline tracks in library`}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeSwitcherButton
            currentTheme={themeMode}
            onThemeSelect={onSelectTheme}
          />

          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            aria-label="Add folder to library"
            title="Add folder to library"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <FolderPlus className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onRescanDevice}
            aria-label="Rescan device files"
            title="Rescan device files"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onFetchAllThumbnails(allSongs)}
            aria-label="Download YouTube pictures for all songs"
            title="Download YouTube pictures for all songs"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>

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

      {/* Segmented View Toggle (Folders Gallery vs All Songs) + Sort Control */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setViewMode('folders')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
              viewMode === 'folders'
                ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <FolderIcon className="w-3.5 h-3.5" />
            <span>Folders ({addedFolders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('tracks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
              viewMode === 'tracks'
                ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>All Tracks ({allSongs.length})</span>
          </button>
        </div>

        {viewMode === 'tracks' && (
          <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as TrackSortMode)}
              aria-label="Sort songs by"
              className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-primary)] focus:outline-none"
            >
              <option value="popular">Most Played</option>
              <option value="title">Title (A–Z)</option>
              <option value="artist">Artist (A–Z)</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <MinimalSearchBar
        query={searchQuery}
        onQueryChange={onSearchQueryChange}
        placeholderText={
          viewMode === 'folders'
            ? 'Filter folders...'
            : 'Search tracks, artists, or albums...'
        }
      />

      {viewMode === 'tracks' ? (
        sortedAllTracks.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--text-muted)]">
            No songs match &lsquo;{searchQuery}&rsquo;
          </div>
        ) : (
          <div className="space-y-1 pt-1">
            {sortedAllTracks.map((song) => (
              <SongListItem
                key={song.id}
                song={song}
                isPlaying={isPlaying}
                isCurrentSong={currentSongId === song.id}
                onSongClick={() => onPlaySong(song, sortedAllTracks)}
                onFavoriteToggle={() => onToggleFavorite(song)}
                onAddToPlaylistClick={() => onAddToPlaylistClick(song)}
                onFetchArtwork={() => onFetchSongArtwork(song)}
                showPlayCount={true}
              />
            ))}
          </div>
        )
      ) : addedFolders.length === 0 ? (
        <div className="py-16 px-6 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)]">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              No Music Folders
            </h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Add music folders from your device to organize your songs into clean,
              dedicated collections.
            </p>
          </div>
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="px-5 h-11 rounded-full bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-xs font-bold inline-flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Add Folder from Device</span>
          </button>
        </div>
      ) : filteredFolders.length === 0 ? (
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">
          No folders match &lsquo;{searchQuery}&rsquo;
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1">
          {filteredFolders.map((folder) => {
            const trackCount = folderCountMap.get(folder.id) ?? folder.songCount;
            return (
              <FolderGalleryCard
                key={folder.id}
                folder={folder}
                trackCount={trackCount}
                onOpenFolder={onOpenFolder}
                onPlayFolder={onPlayFolder}
                onConfirmFolderArtwork={onConfirmFolderArtwork}
                onTryAgainFolderArtwork={onTryAgainFolderArtwork}
                onRefreshFolderArtwork={onRefreshFolderArtwork}
                onRemoveFolder={onRemoveFolder}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});

interface FolderGalleryCardProps {
  folder: AddedFolder;
  trackCount: number;
  onOpenFolder: (folder: AddedFolder) => void;
  onPlayFolder: (folder: AddedFolder, shuffle: boolean) => void;
  onConfirmFolderArtwork: (folderId: number) => void;
  onTryAgainFolderArtwork: (folder: AddedFolder) => void;
  onRefreshFolderArtwork: (folder: AddedFolder) => void;
  onRemoveFolder: (folder: AddedFolder) => void;
}

const FolderGalleryCard: React.FC<FolderGalleryCardProps> = React.memo(({
  folder,
  trackCount,
  onOpenFolder,
  onPlayFolder,
  onConfirmFolderArtwork,
  onTryAgainFolderArtwork,
  onRefreshFolderArtwork,
  onRemoveFolder,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-2.5 flex flex-col gap-2.5 hover:border-[var(--text-secondary)]/50 transition-colors">
      {/* Square Cover Art */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => onOpenFolder(folder)}
          aria-label={`Open folder ${folder.name}`}
          className="w-full h-full block focus:outline-none"
        >
          <FolderCoverImage
            artworkUri={folder.artworkUri}
            folderName={folder.name}
            size={0}
            radius={10}
            className="w-full h-full"
          />
        </button>

        {/* Top-Right 3-dot Menu */}
        <div className="absolute top-1.5 right-1.5" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((v) => !v);
            }}
            aria-label={`Folder options for ${folder.name}`}
            className="w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/65 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-xl py-1 z-30">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onOpenFolder(folder);
                }}
                className="w-full px-3 py-2 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
              >
                Open Folder
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onRefreshFolderArtwork(folder);
                }}
                className="w-full px-3 py-2 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
              >
                Search Web Cover
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onRemoveFolder(folder);
                }}
                className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-[var(--bg-surface)]"
              >
                Remove from Library
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Keep / Try Again Controls if Unconfirmed */}
      {!folder.isArtworkConfirmed && folder.artworkUri && (
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onConfirmFolderArtwork(folder.id)}
            className="h-7 rounded-full bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-[10px] font-bold inline-flex items-center justify-center gap-1"
          >
            <Check className="w-3 h-3" />
            <span>Keep</span>
          </button>
          <button
            type="button"
            onClick={() => onTryAgainFolderArtwork(folder)}
            className="h-7 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center justify-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Try</span>
          </button>
        </div>
      )}

      {/* Folder Name & Track Count */}
      <button
        type="button"
        onClick={() => onOpenFolder(folder)}
        className="text-left focus:outline-none space-y-0.5"
      >
        <div className="flex items-center gap-1.5">
          <FolderIcon className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
          <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
            {folder.name}
          </span>
        </div>
        <div className="text-[11px] font-mono tabular-nums text-[var(--text-muted)]">
          {trackCount} tracks
        </div>
      </button>

      {/* Play & Mix Buttons */}
      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={() => onPlayFolder(folder, false)}
          aria-label={`Play folder ${folder.name}`}
          className="h-8 rounded-full bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-[11px] font-bold inline-flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Play</span>
        </button>

        <button
          type="button"
          onClick={() => onPlayFolder(folder, true)}
          aria-label={`Shuffle folder ${folder.name}`}
          className="h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center justify-center gap-1 transition-colors"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Mix</span>
        </button>
      </div>
    </div>
  );
});
