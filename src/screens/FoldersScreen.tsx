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
  Trash2,
  HardDrive,
} from 'lucide-react';
import { FileExplorerItem, Song } from '../types/music';
import {
  EqualizerIndicator,
  MinimalArtwork,
} from '../components/MinimalComponents';

export interface LocalFileWithPath {
  file: File;
  relativePath: string;
}

interface FoldersScreenProps {
  currentPath: string;
  openedRoots: Array<{ name: string; path: string }>;
  directoryItems: FileExplorerItem[];
  hasOpenedFiles: boolean;
  currentSongId: number | null;
  isPlaying: boolean;
  onNavigateTo: (path: string) => void;
  onNavigateUp: () => void;
  onAddDirectoryToLibrary: (dirPath: string, dirName: string) => void;
  onAddSingleSongToLibrary: (song: Song) => void;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onAddToPlaylistClick: (song: Song) => void;
  onFetchArtwork: (song: Song) => void;
  onOpenExplorerFiles: (entries: LocalFileWithPath[], rootLabel?: string) => void;
  onClearExplorer: () => void;
}

async function readDirectoryHandleRecursively(
  dirHandle: any,
  prefix: string
): Promise<LocalFileWithPath[]> {
  const results: LocalFileWithPath[] = [];
  for await (const entry of dirHandle.values()) {
    const entryPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      results.push({ file, relativePath: entryPath });
    } else if (entry.kind === 'directory') {
      const nested = await readDirectoryHandleRecursively(entry, entryPath);
      results.push(...nested);
    }
  }
  return results;
}

async function readDroppedEntry(
  entry: FileSystemEntry,
  prefix = ''
): Promise<LocalFileWithPath[]> {
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    return new Promise((resolve) => {
      fileEntry.file(
        (file) => {
          const rel = prefix ? `${prefix}/${file.name}` : file.name;
          resolve([{ file, relativePath: rel }]);
        },
        () => resolve([])
      );
    });
  }
  if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry;
    const reader = dirEntry.createReader();
    const entries: FileSystemEntry[] = [];
    const readBatch = (): Promise<void> =>
      new Promise((resolve) => {
        reader.readEntries(
          (batch) => {
            if (batch.length === 0) {
              resolve();
            } else {
              entries.push(...batch);
              readBatch().then(resolve);
            }
          },
          () => resolve()
        );
      });
    await readBatch();
    const nextPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
    const nested = await Promise.all(
      entries.map((child) => readDroppedEntry(child, nextPrefix))
    );
    return nested.flat();
  }
  return [];
}

export const FoldersScreen: React.FC<FoldersScreenProps> = React.memo(({
  currentPath,
  openedRoots,
  directoryItems,
  hasOpenedFiles,
  currentSongId,
  isPlaying,
  onNavigateTo,
  onNavigateUp,
  onAddDirectoryToLibrary,
  onAddSingleSongToLibrary,
  onPlaySong,
  onAddToPlaylistClick,
  onFetchArtwork,
  onOpenExplorerFiles,
  onClearExplorer,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [openMenuPath, setOpenMenuPath] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const audioItems = directoryItems.filter(
    (item): item is Extract<FileExplorerItem, { type: 'audio' }> =>
      item.type === 'audio'
  );

  const currentDirName =
    currentPath.split('/').filter(Boolean).pop() || 'Selected Files';

  const handleFileList = (fileList: FileList | null, fallbackRoot?: string) => {
    if (!fileList || fileList.length === 0) return;
    const entries: LocalFileWithPath[] = Array.from(fileList).map((file) => {
      const f = file as File & { webkitRelativePath?: string };
      const rel = f.webkitRelativePath && f.webkitRelativePath.trim()
        ? f.webkitRelativePath
        : fallbackRoot
          ? `${fallbackRoot}/${file.name}`
          : file.name;
      return { file, relativePath: rel };
    });
    const firstRoot = entries[0]?.relativePath.includes('/')
      ? entries[0].relativePath.split('/')[0]
      : fallbackRoot || 'Selected Files';
    onOpenExplorerFiles(entries, firstRoot);
  };

  const handleOpenFolderClick = async () => {
    const canUseNativePicker =
      typeof window !== 'undefined' &&
      window.self === window.top &&
      'showDirectoryPicker' in window;

    if (canUseNativePicker) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'read',
        });
        const entries = await readDirectoryHandleRecursively(
          dirHandle,
          dirHandle.name
        );
        if (entries.length > 0) {
          onOpenExplorerFiles(entries, dirHandle.name);
        }
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        // Fallback to input directory picker below
      }
    }
    folderInputRef.current?.click();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer?.items;
    if (items && items.length > 0) {
      const entries = Array.from(items)
        .map((item) => item.webkitGetAsEntry?.())
        .filter((entry): entry is FileSystemEntry => Boolean(entry));

      if (entries.length > 0) {
        const resolved = (
          await Promise.all(entries.map((entry) => readDroppedEntry(entry)))
        ).flat();
        if (resolved.length > 0) {
          const rootName = entries[0].isDirectory
            ? entries[0].name
            : 'Dropped Files';
          onOpenExplorerFiles(
            resolved.map((r) => ({
              file: r.file,
              relativePath: r.relativePath.includes('/')
                ? r.relativePath
                : `${rootName}/${r.file.name}`,
            })),
            rootName
          );
          return;
        }
      }
    }

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleFileList(e.dataTransfer.files, 'Dropped Files');
    }
  };

  return (
    <div
      className="space-y-4 pb-8"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.lrc,.txt"
        onChange={(e) => {
          handleFileList(e.target.files, 'Selected Files');
          e.target.value = '';
        }}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={(e) => {
          handleFileList(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Header & Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Explorer
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Open real local folders or audio files from your device
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenFolderClick}
            aria-label="Open folder from device"
            title="Open folder from device"
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--text-primary)] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Open Folder</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Select audio files"
            title="Select audio files"
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--text-primary)] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <FilePlus2 className="w-4 h-4" />
            <span className="hidden sm:inline">Select Files</span>
          </button>

          {hasOpenedFiles && (
            <button
              type="button"
              onClick={onClearExplorer}
              aria-label="Clear opened explorer files"
              title="Clear explorer"
              className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Opened Device Roots (Only shown if user opened folders/files) */}
      {openedRoots.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {openedRoots.map((root) => {
            const isSelected = currentPath === root.path;
            return (
              <button
                key={root.path}
                type="button"
                onClick={() => onNavigateTo(root.path)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-contrast)] font-bold'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]'
                }`}
              >
                <FolderIcon className="w-3.5 h-3.5" />
                <span>{root.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Breadcrumb Navigation Bar (Only shown when real files/folders are opened) */}
      {hasOpenedFiles && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onNavigateUp}
              disabled={!currentPath}
              aria-label="Up one directory"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-30 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-[var(--text-primary)] truncate font-mono">
              {currentPath ? `/${currentPath}` : '/ Opened Folders'}
            </span>
          </div>

          {audioItems.length > 0 && currentPath && (
            <button
              type="button"
              onClick={() => onAddDirectoryToLibrary(currentPath, currentDirName)}
              className="px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
            >
              Add All ({audioItems.length})
            </button>
          )}
        </div>
      )}

      {/* Empty State vs Directory Content List */}
      {!hasOpenedFiles ? (
        <div
          className={`rounded-2xl border-2 border-dashed p-10 sm:p-14 flex flex-col items-center justify-center text-center space-y-4 transition-colors ${
            isDragging
              ? 'border-[var(--text-primary)] bg-[var(--bg-elevated)]'
              : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-secondary)]">
            <HardDrive className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
              No Device Folder Opened
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Your phone or computer&apos;s internal memory stays private and is never listed here automatically. Pick a folder or audio files from your device—or drop them here—to browse and play them locally.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap justify-center pt-1">
            <button
              type="button"
              onClick={handleOpenFolderClick}
              className="px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-xs font-bold inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Open Folder from Device</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] inline-flex items-center gap-2 hover:border-[var(--text-primary)] transition-colors"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Select Audio Files</span>
            </button>
          </div>
        </div>
      ) : directoryItems.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
          <FolderOpen className="w-12 h-12 text-[var(--text-muted)]" />
          <p className="text-sm font-medium text-[var(--text-muted)]">
            No audio files in this folder
          </p>
          <p className="text-xs text-[var(--text-muted)]/70">
            Supported formats: MP3, M4A, WAV, FLAC, OGG, AAC, OPUS, plus .LRC lyrics
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
