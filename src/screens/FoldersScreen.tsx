import React, { useState, useRef } from 'react';
import {
  FolderPlus,
  FilePlus2,
  ArrowLeft,
  Folder as FolderIcon,
  FolderOpen,
  Plus,
  Play,
  MoreVertical,
} from 'lucide-react';
import { FileExplorerItem, Song } from '../types/music';
import { COMMON_STORAGE_ROOTS } from '../data/preseededData';
import {
  EqualizerIndicator,
  MinimalArtwork,
} from '../components/MinimalComponents';

interface FoldersScreenProps {
  currentPath: string;
  directoryItems: FileExplorerItem[];
  currentSongId: number | null;
  isPlaying: boolean;
  onNavigateTo: (path: string) => void;
  onNavigateUp: () => void;
  onAddDirectoryToLibrary: (dirPath: string, dirName: string) => void;
  onAddSingleSongToLibrary: (song: Song) => void;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onAddToPlaylistClick: (song: Song) => void;
  onFetchArtwork: (song: Song) => void;
  onImportLocalFiles: (files: FileList, folderName?: string) => void;
}

export const FoldersScreen: React.FC<FoldersScreenProps> = React.memo(({
  currentPath,
  directoryItems,
  currentSongId,
  isPlaying,
  onNavigateTo,
  onNavigateUp,
  onAddDirectoryToLibrary,
  onAddSingleSongToLibrary,
  onPlaySong,
  onAddToPlaylistClick,
  onFetchArtwork,
  onImportLocalFiles,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [openMenuPath, setOpenMenuPath] = useState<string | null>(null);

  const audioItems = directoryItems.filter(
    (item): item is Extract<FileExplorerItem, { type: 'audio' }> =>
      item.type === 'audio'
  );

  const currentDirName =
    currentPath.split('/').filter(Boolean).pop() || currentPath;

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportLocalFiles(e.target.files, currentDirName);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4 pb-8">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.lrc,.txt"
        onChange={handleFilesSelected}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        accept="audio/*,.lrc,.txt"
        onChange={handleFilesSelected}
        className="hidden"
      />

      {/* Header & Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Explorer
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Browse &amp; add local folders or audio files
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            aria-label="Pick folder from storage"
            title="Pick folder from storage"
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--text-primary)] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Import Folder</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Pick audio files"
            title="Pick audio files"
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--text-primary)] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <FilePlus2 className="w-4 h-4" />
            <span className="hidden sm:inline">Import Audio Files</span>
          </button>
        </div>
      </div>

      {/* Quick Root Shortcuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {COMMON_STORAGE_ROOTS.map((root) => {
          const isSelected = currentPath === root.path;
          return (
            <button
              key={root.path}
              type="button"
              onClick={() => onNavigateTo(root.path)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs transition-colors whitespace-nowrap ${
                isSelected
                  ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] font-bold'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]'
              }`}
            >
              {root.name}
            </button>
          );
        })}
      </div>

      {/* Breadcrumb Navigation Bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onNavigateUp}
            aria-label="Up one directory"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-[var(--text-primary)] truncate font-mono">
            {currentPath}
          </span>
        </div>

        {audioItems.length > 0 && (
          <button
            type="button"
            onClick={() => onAddDirectoryToLibrary(currentPath, currentDirName)}
            className="px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            Add All ({audioItems.length})
          </button>
        )}
      </div>

      {/* Directory Content List */}
      {directoryItems.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
          <FolderOpen className="w-12 h-12 text-[var(--text-muted)]" />
          <p className="text-sm font-medium text-[var(--text-muted)]">
            Folder is empty or has no audio files
          </p>
          <p className="text-xs text-[var(--text-muted)]/70">
            Use the buttons at top to pick folders or files from anywhere
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {directoryItems.map((item) => {
            if (item.type === 'directory') {
              return (
                <div
                  key={`dir_${item.path}`}
                  className="flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl hover:bg-[var(--bg-elevated)]/60 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onNavigateTo(item.path)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left focus:outline-none"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                      <FolderIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {item.name}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
                        {item.audioCount > 0
                          ? `${item.itemCount} items · ${item.audioCount} audio tracks`
                          : `${item.itemCount} items`}
                      </div>
                    </div>
                  </button>

                  {item.audioCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onAddDirectoryToLibrary(item.path, item.name)}
                      aria-label={`Add folder ${item.name} to library`}
                      title={`Add folder ${item.name} to library`}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              );
            }

            const isCurrentSong = currentSongId === item.song.id;
            const contextSongs = audioItems.map((a) => a.song);

            return (
              <div
                key={`audio_${item.path}`}
                className="flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl hover:bg-[var(--bg-elevated)]/60 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onPlaySong(item.song, contextSongs)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
                    {isCurrentSong && isPlaying ? (
                      <EqualizerIndicator />
                    ) : (
                      <MinimalArtwork
                        title={item.song.title}
                        size={40}
                        radius={10}
                        artworkUri={item.song.artworkUri}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`text-sm truncate ${
                        isCurrentSong
                          ? 'font-bold text-[var(--text-primary)]'
                          : 'font-normal text-[var(--text-primary)]'
                      }`}
                    >
                      {item.song.title}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] truncate font-mono tabular-nums">
                      {item.song.artist} · {item.sizeFormatted}
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onPlaySong(item.song, contextSongs)}
                    aria-label={`Play ${item.song.title}`}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuPath((prev) =>
                          prev === item.path ? null : item.path
                        )
                      }
                      aria-label={`Options for ${item.song.title}`}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuPath === item.path && (
                      <div className="absolute right-0 mt-1 w-44 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-xl py-1 z-30">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuPath(null);
                            onFetchArtwork(item.song);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                        >
                          Get YouTube Picture
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuPath(null);
                            onAddSingleSongToLibrary(item.song);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                        >
                          Add to Library
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuPath(null);
                            onAddToPlaylistClick(item.song);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                        >
                          Add to Playlist
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
