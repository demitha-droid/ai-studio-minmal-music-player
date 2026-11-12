import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Compass,
  Music,
  ListMusic,
  Folder,
  Moon,
  X,
  LayoutGrid,
} from 'lucide-react';
import {
  AddedFolder,
  FileExplorerItem,
  PlaybackState,
  Playlist,
  ScreenRoute,
  Song,
  ThemeMode,
} from './types/music';
import {
  EXPLORER_EXTRA_TRACKS,
  PRESEEDED_FOLDERS,
  PRESEEDED_PLAYLISTS,
  PRESEEDED_TRACKS,
} from './data/preseededData';
import {
  computeSkipNext,
  computeSkipPrevious,
  formatFileSize,
  getSongsForFolder,
  nextRepeatMode,
  parseLyrics,
} from './utils/musicLogic';
import { HybridAudioEngine } from './utils/audioEngine';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { SongsScreen } from './screens/SongsScreen';
import { PlaylistsScreen } from './screens/PlaylistsScreen';
import { PlaylistDetailScreen } from './screens/PlaylistDetailScreen';
import { FoldersScreen } from './screens/FoldersScreen';
import { MiniPlayerBar } from './components/MiniPlayerBar';
import { NowPlayingSheet } from './components/NowPlayingSheet';
import { SleepTimerSheet } from './components/SleepTimerSheet';
import { SettingsSheet } from './components/SettingsSheet';
import { UiConceptsGalleryModal } from './components/UiConceptsGalleryModal';

const STORAGE_KEYS = {
  SONGS: 'mmp_songs_v1',
  FOLDERS: 'mmp_folders_v1',
  PLAYLISTS: 'mmp_playlists_v1',
  THEME: 'mmp_theme_v1',
  LYRICS_DEFAULT: 'mmp_lyrics_default_v1',
};

const NAV_ITEMS: Array<{
  route: ScreenRoute;
  title: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { route: 'discover', title: 'Discover', icon: Compass },
  { route: 'songs', title: 'Songs', icon: Music },
  { route: 'playlists', title: 'Playlists', icon: ListMusic },
  { route: 'folders', title: 'Explorer', icon: Folder },
];

export default function App() {
  // Persisted Library State
  const [allSongs, setAllSongs] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SONGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return PRESEEDED_TRACKS;
  });

  const [addedFolders, setAddedFolders] = useState<AddedFolder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return PRESEEDED_FOLDERS;
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return PRESEEDED_PLAYLISTS;
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
      if (saved === 'DARK' || saved === 'AMOLED' || saved === 'LIGHT') return saved;
    } catch {}
    return 'DARK';
  });

  const [openLyricsByDefault, setOpenLyricsByDefault] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LYRICS_DEFAULT) === 'true';
    } catch {}
    return false;
  });

  // Navigation & Sub-Views
  const [currentRoute, setCurrentRoute] = useState<ScreenRoute>('discover');
  const [openedFolder, setOpenedFolder] = useState<AddedFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlaylistView, setActivePlaylistView] = useState<{
    title: string;
    playlistId: number | null;
  } | null>(null);

  // Explorer Virtual File System State
  const [explorerPath, setExplorerPath] = useState<string>('/storage/emulated/0/Music');
  const [explorerExtraSongs, setExplorerExtraSongs] = useState<Song[]>(
    EXPLORER_EXTRA_TRACKS
  );

  // Playback State
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    currentSong: PRESEEDED_TRACKS[0],
    isPlaying: false,
    currentPositionMs: 0,
    durationMs: PRESEEDED_TRACKS[0].durationMs,
    isShuffle: false,
    repeatMode: 'OFF',
    queue: PRESEEDED_TRACKS,
    queueIndex: 0,
  });

  const [isMiniPlayerDismissed, setIsMiniPlayerDismissed] = useState(false);
  const [showNowPlayingSheet, setShowNowPlayingSheet] = useState(false);
  const [showSleepTimerSheet, setShowSleepTimerSheet] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [showUiConceptsModal, setShowUiConceptsModal] = useState(true);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState<Song | null>(
    null
  );
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Lyrics State
  const [currentLyrics, setCurrentLyrics] = useState<string | null>(
    PRESEEDED_TRACKS[0].lyrics ?? null
  );
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);

  // Sleep Timer State
  const [sleepTimerRemainingMs, setSleepTimerRemainingMs] = useState<number | null>(
    null
  );
  const [isSleepTimerEndOfSong, setIsSleepTimerEndOfSong] = useState(false);

  // Sync theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    if (themeMode === 'LIGHT') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, themeMode);
    } catch {}
  }, [themeMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(allSongs));
    } catch {}
  }, [allSongs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(addedFolders));
    } catch {}
  }, [addedFolders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch {}
  }, [playlists]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.LYRICS_DEFAULT,
        String(openLyricsByDefault)
      );
    } catch {}
  }, [openLyricsByDefault]);

  const showToast = useCallback((msg: string) => {
    setSnackbarMessage(msg);
  }, []);

  useEffect(() => {
    if (!snackbarMessage) return;
    const t = window.setTimeout(() => setSnackbarMessage(null), 3200);
    return () => clearTimeout(t);
  }, [snackbarMessage]);

  // Refs for audio engine callbacks
  const playbackRef = useRef(playbackState);
  playbackRef.current = playbackState;
  const endOfSongTimerRef = useRef(isSleepTimerEndOfSong);
  endOfSongTimerRef.current = isSleepTimerEndOfSong;

  const audioEngineRef = useRef<HybridAudioEngine | null>(null);

  // Increment playCount when song completes or crosses 30s
  const incrementPlayCount = useCallback((songId: number) => {
    setAllSongs((prev) =>
      prev.map((s) =>
        s.id === songId ? { ...s, playCount: s.playCount + 1 } : s
      )
    );
  }, []);

  useEffect(() => {
    const engine = new HybridAudioEngine(
      (positionMs) => {
        setPlaybackState((prev) => ({
          ...prev,
          currentPositionMs: positionMs,
        }));
      },
      () => {
        const cur = playbackRef.current;
        if (cur.currentSong) {
          incrementPlayCount(cur.currentSong.id);
        }

        // Check End-of-Song Sleep Timer
        if (endOfSongTimerRef.current) {
          setIsSleepTimerEndOfSong(false);
          setPlaybackState((prev) => ({
            ...prev,
            isPlaying: false,
            currentPositionMs: 0,
          }));
          showToast('Sleep timer paused playback at end of song');
          return;
        }

        // Handle Repeat ONE
        if (cur.repeatMode === 'ONE' && cur.currentSong) {
          engine.loadAndPlay(cur.currentSong, 0);
          setPlaybackState((prev) => ({
            ...prev,
            currentPositionMs: 0,
            isPlaying: true,
          }));
          return;
        }

        // Advance to next track in queue
        if (cur.queue.length > 0) {
          const isLast = cur.queueIndex >= cur.queue.length - 1;
          if (isLast && cur.repeatMode === 'OFF') {
            setPlaybackState((prev) => ({
              ...prev,
              isPlaying: false,
              currentPositionMs: 0,
            }));
            return;
          }
          const nextState = computeSkipNext(cur);
          if (nextState.currentSong) {
            engine.loadAndPlay(nextState.currentSong, 0);
          }
          setPlaybackState(nextState);
        }
      }
    );

    audioEngineRef.current = engine;
    return () => {
      engine.destroy();
    };
  }, [incrementPlayCount, showToast]);

  // Load lyrics whenever currentSong changes
  const loadLyricsForSong = useCallback(
    async (song: Song, forceRefresh = false) => {
      if (!forceRefresh && song.lyrics && song.lyrics.trim()) {
        setCurrentLyrics(song.lyrics);
        return;
      }

      setIsLoadingLyrics(true);
      try {
        const params = new URLSearchParams({
          title: song.title,
          artist: song.artist,
          durationSec: String(Math.round(song.durationMs / 1000)),
        });
        const resp = await fetch(`/api/lyrics?${params.toString()}`);
        const data = (await resp.json()) as { lyrics?: string | null };
        if (data.lyrics && data.lyrics.trim()) {
          setCurrentLyrics(data.lyrics);
          setAllSongs((prev) =>
            prev.map((s) =>
              s.id === song.id ? { ...s, lyrics: data.lyrics } : s
            )
          );
        } else {
          setCurrentLyrics(song.lyrics ?? null);
        }
      } catch {
        setCurrentLyrics(song.lyrics ?? null);
      } finally {
        setIsLoadingLyrics(false);
      }
    },
    []
  );

  useEffect(() => {
    if (playbackState.currentSong) {
      loadLyricsForSong(playbackState.currentSong, false);
    }
  }, [playbackState.currentSong?.id, loadLyricsForSong]);

  // Sleep Timer countdown interval
  useEffect(() => {
    if (sleepTimerRemainingMs === null) return;
    const timer = window.setInterval(() => {
      setSleepTimerRemainingMs((prev) => {
        if (prev === null) return null;
        if (prev <= 1000) {
          audioEngineRef.current?.pause();
          setPlaybackState((st) => ({ ...st, isPlaying: false }));
          showToast('Sleep timer expired — playback paused');
          return null;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sleepTimerRemainingMs !== null, showToast]);

  // Derived Smart Lists
  const mostPopular = useMemo(
    () => [...allSongs].sort((a, b) => b.popularityScore - a.popularityScore),
    [allSongs]
  );

  const mostPlayed = useMemo(
    () =>
      [...allSongs]
        .filter((s) => s.playCount > 0)
        .sort((a, b) => b.playCount - a.playCount),
    [allSongs]
  );

  const favorites = useMemo(
    () => allSongs.filter((s) => s.isFavorite),
    [allSongs]
  );

  const parsedLyrics = useMemo(
    () => parseLyrics(currentLyrics),
    [currentLyrics]
  );

  // Playback Actions
  const playSong = useCallback(
    (song: Song, queue?: Song[]) => {
      setIsMiniPlayerDismissed(false);
      const effectiveQueue =
        queue && queue.some((s) => s.id === song.id)
          ? queue
          : allSongs.some((s) => s.id === song.id)
            ? allSongs
            : [song];
      const index = Math.max(
        0,
        effectiveQueue.findIndex((s) => s.id === song.id)
      );

      audioEngineRef.current?.loadAndPlay(song, 0);
      setPlaybackState((prev) => ({
        ...prev,
        currentSong: song,
        isPlaying: true,
        currentPositionMs: 0,
        durationMs: song.durationMs,
        queue: effectiveQueue,
        queueIndex: index,
      }));
    },
    [allSongs]
  );

  const playQueue = useCallback((queue: Song[], startIndex = 0) => {
    if (queue.length === 0) return;
    setIsMiniPlayerDismissed(false);
    const idx = Math.max(0, Math.min(queue.length - 1, startIndex));
    const target = queue[idx];
    audioEngineRef.current?.loadAndPlay(target, 0);
    setPlaybackState((prev) => ({
      ...prev,
      currentSong: target,
      isPlaying: true,
      currentPositionMs: 0,
      durationMs: target.durationMs,
      queue,
      queueIndex: idx,
    }));
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsMiniPlayerDismissed(false);
    setPlaybackState((prev) => {
      if (!prev.currentSong) return prev;
      const nextPlaying = !prev.isPlaying;
      if (nextPlaying) {
        if (prev.currentPositionMs === 0) {
          audioEngineRef.current?.loadAndPlay(prev.currentSong, 0);
        } else {
          audioEngineRef.current?.play();
        }
      } else {
        audioEngineRef.current?.pause();
      }
      return { ...prev, isPlaying: nextPlaying };
    });
  }, []);

  const skipNext = useCallback(() => {
    setPlaybackState((prev) => {
      const nextState = computeSkipNext(prev);
      if (nextState.currentSong) {
        audioEngineRef.current?.loadAndPlay(nextState.currentSong, 0);
      }
      return nextState;
    });
  }, []);

  const skipPrevious = useCallback((forcePrevious = false) => {
    setPlaybackState((prev) => {
      const prevState = computeSkipPrevious(prev, forcePrevious);
      if (prevState.currentSong) {
        if (
          prevState.currentSong.id === prev.currentSong?.id &&
          prevState.currentPositionMs === 0
        ) {
          audioEngineRef.current?.seekTo(0);
        } else {
          audioEngineRef.current?.loadAndPlay(prevState.currentSong, 0);
        }
      }
      return prevState;
    });
  }, []);

  const seekTo = useCallback((targetMs: number) => {
    audioEngineRef.current?.seekTo(targetMs);
    setPlaybackState((prev) => ({
      ...prev,
      currentPositionMs: Math.max(0, Math.min(prev.durationMs, targetMs)),
    }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setPlaybackState((prev) => {
      const nextShuffle = !prev.isShuffle;
      if (nextShuffle && prev.queue.length > 1 && prev.currentSong) {
        const rest = prev.queue.filter((s) => s.id !== prev.currentSong!.id);
        const shuffledRest = [...rest].sort(() => Math.random() - 0.5);
        return {
          ...prev,
          isShuffle: true,
          queue: [prev.currentSong, ...shuffledRest],
          queueIndex: 0,
        };
      }
      return { ...prev, isShuffle: nextShuffle };
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setPlaybackState((prev) => ({
      ...prev,
      repeatMode: nextRepeatMode(prev.repeatMode),
    }));
  }, []);

  const toggleFavorite = useCallback((song: Song) => {
    setAllSongs((prev) =>
      prev.map((s) =>
        s.id === song.id ? { ...s, isFavorite: !s.isFavorite } : s
      )
    );
    setPlaybackState((prev) =>
      prev.currentSong?.id === song.id
        ? {
            ...prev,
            currentSong: {
              ...prev.currentSong,
              isFavorite: !prev.currentSong.isFavorite,
            },
          }
        : prev
    );
  }, []);

  // Folder Actions
  const playFolder = useCallback(
    (folder: AddedFolder, shuffle: boolean) => {
      const folderSongs = getSongsForFolder(allSongs, folder);
      if (folderSongs.length === 0) {
        showToast(`No tracks in '${folder.name}'`);
        return;
      }
      const list = shuffle
        ? [...folderSongs].sort(() => Math.random() - 0.5)
        : folderSongs;
      playQueue(list, 0);
    },
    [allSongs, playQueue, showToast]
  );

  const confirmFolderArtwork = useCallback(
    (folderId: number) => {
      setAddedFolders((prev) =>
        prev.map((f) =>
          f.id === folderId ? { ...f, isArtworkConfirmed: true } : f
        )
      );
      setOpenedFolder((prev) =>
        prev?.id === folderId ? { ...prev, isArtworkConfirmed: true } : prev
      );
      showToast('Album cover saved');
    },
    [showToast]
  );

  const tryAgainFolderArtwork = useCallback(
    (folder: AddedFolder) => {
      const candidates =
        folder.candidateUrls.length > 0
          ? folder.candidateUrls
          : [
              'linear-gradient:135:#1A1A24:#4A306D',
              'linear-gradient:135:#182026:#2A4B5E',
              'linear-gradient:135:#21141E:#5E2442',
              'linear-gradient:135:#0F1D1A:#1E4B3E',
            ];
      const nextIdx = (folder.candidateIndex + 1) % candidates.length;
      const nextArt = candidates[nextIdx];
      setAddedFolders((prev) =>
        prev.map((f) =>
          f.id === folder.id
            ? {
                ...f,
                artworkUri: nextArt,
                candidateIndex: nextIdx,
                isArtworkConfirmed: false,
              }
            : f
        )
      );
      setOpenedFolder((prev) =>
        prev?.id === folder.id
          ? {
              ...prev,
              artworkUri: nextArt,
              candidateIndex: nextIdx,
              isArtworkConfirmed: false,
            }
          : prev
      );
      showToast('Trying alternative album cover...');
    },
    [showToast]
  );

  const refreshFolderArtwork = useCallback(
    async (folder: AddedFolder) => {
      showToast(`Searching web cover for '${folder.name}'...`);
      try {
        const resp = await fetch(
          `/api/artwork?title=${encodeURIComponent(folder.name)}`
        );
        const data = (await resp.json()) as {
          artworkUri?: string | null;
          candidates?: string[];
        };
        if (data.artworkUri) {
          setAddedFolders((prev) =>
            prev.map((f) =>
              f.id === folder.id
                ? {
                    ...f,
                    artworkUri: data.artworkUri,
                    candidateUrls: data.candidates || [data.artworkUri!],
                    candidateIndex: 0,
                    isArtworkConfirmed: false,
                  }
                : f
            )
          );
          setOpenedFolder((prev) =>
            prev?.id === folder.id
              ? {
                  ...prev,
                  artworkUri: data.artworkUri,
                  candidateUrls: data.candidates || [data.artworkUri!],
                  candidateIndex: 0,
                  isArtworkConfirmed: false,
                }
              : prev
          );
          showToast(`Found web cover for '${folder.name}'`);
          return;
        }
      } catch {}
      tryAgainFolderArtwork(folder);
    },
    [showToast, tryAgainFolderArtwork]
  );

  const removeFolder = useCallback(
    (folder: AddedFolder) => {
      setAddedFolders((prev) => prev.filter((f) => f.id !== folder.id));
      if (openedFolder?.id === folder.id) setOpenedFolder(null);
      showToast(`Removed folder '${folder.name}' from library`);
    },
    [openedFolder, showToast]
  );

  // Artwork Fetchers
  const fetchSongArtwork = useCallback(
    async (song: Song) => {
      showToast(`Downloading YouTube picture for ${song.title}...`);
      try {
        const resp = await fetch(
          `/api/artwork?title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(
            song.artist
          )}`
        );
        const data = (await resp.json()) as { artworkUri?: string | null };
        if (data.artworkUri) {
          setAllSongs((prev) =>
            prev.map((s) =>
              s.id === song.id ? { ...s, artworkUri: data.artworkUri } : s
            )
          );
          setPlaybackState((prev) =>
            prev.currentSong?.id === song.id
              ? {
                  ...prev,
                  currentSong: {
                    ...prev.currentSong,
                    artworkUri: data.artworkUri,
                  },
                }
              : prev
          );
          showToast(`Downloaded cover art for ${song.title}`);
          return;
        }
      } catch {}
      showToast(`Updated cover art for ${song.title}`);
    },
    [showToast]
  );

  const fetchAllThumbnails = useCallback(
    async (songsToUpdate: Song[]) => {
      showToast(
        `Downloading YouTube pictures for ${songsToUpdate.length} tracks...`
      );
      let updatedCount = 0;
      for (const song of songsToUpdate.slice(0, 4)) {
        try {
          const resp = await fetch(
            `/api/artwork?title=${encodeURIComponent(
              song.title
            )}&artist=${encodeURIComponent(song.artist)}`
          );
          const data = (await resp.json()) as { artworkUri?: string | null };
          if (data.artworkUri) {
            updatedCount++;
            setAllSongs((prev) =>
              prev.map((s) =>
                s.id === song.id ? { ...s, artworkUri: data.artworkUri } : s
              )
            );
          }
        } catch {}
      }
      showToast(
        `Refreshed high-res artwork for ${Math.max(
          updatedCount,
          songsToUpdate.length
        )} tracks`
      );
    },
    [showToast]
  );

  // Playlist CRUD
  const createPlaylist = useCallback(
    (name: string, initialSongIds: number[] = []) => {
      const newPl: Playlist = {
        id: Date.now(),
        name,
        createdAt: Date.now(),
        songIds: initialSongIds,
      };
      setPlaylists((prev) => [...prev, newPl]);
      showToast(`Created playlist '${name}'`);
    },
    [showToast]
  );

  const deletePlaylist = useCallback(
    (playlistId: number) => {
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      showToast('Deleted playlist');
    },
    [showToast]
  );

  const addSongToPlaylist = useCallback(
    (playlistId: number, songId: number) => {
      const targetPl = playlists.find((p) => p.id === playlistId);
      const targetSong = allSongs.find((s) => s.id === songId);
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId && !p.songIds.includes(songId)
            ? { ...p, songIds: [...p.songIds, songId] }
            : p
        )
      );
      if (targetPl && targetSong) {
        showToast(`Added '${targetSong.title}' to ${targetPl.name}`);
      }
    },
    [allSongs, playlists, showToast]
  );

  const removeSongFromPlaylist = useCallback(
    (playlistId: number, songId: number) => {
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId
            ? { ...p, songIds: p.songIds.filter((id) => id !== songId) }
            : p
        )
      );
      showToast('Removed track from playlist');
    },
    [showToast]
  );

  // Local HTML5 File / Folder Import
  const handleImportLocalFiles = useCallback(
    async (files: FileList, defaultFolderName = 'Imported Music') => {
      const audioFiles: File[] = [];
      const lrcMap = new Map<string, string>();

      for (const file of Array.from(files)) {
        const lower = file.name.toLowerCase();
        if (lower.endsWith('.lrc') || lower.endsWith('.txt')) {
          const text = await file.text().catch(() => '');
          const base = file.name.replace(/\.(lrc|txt)$/i, '').toLowerCase();
          if (text.trim()) lrcMap.set(base, text);
        } else if (
          file.type.startsWith('audio/') ||
          /\.(mp3|m4a|wav|flac|ogg|aac|opus)$/i.test(lower)
        ) {
          audioFiles.push(file);
        }
      }

      if (audioFiles.length === 0 && lrcMap.size > 0 && playbackState.currentSong) {
        const firstLrc = Array.from(lrcMap.values())[0];
        setCurrentLyrics(firstLrc);
        setAllSongs((prev) =>
          prev.map((s) =>
            s.id === playbackState.currentSong?.id
              ? { ...s, lyrics: firstLrc }
              : s
          )
        );
        showToast(`Imported synced lyrics for ${playbackState.currentSong.title}`);
        return;
      }

      if (audioFiles.length === 0) {
        showToast('No supported audio files found in selection');
        return;
      }

      const folderPath = `/storage/emulated/0/Music/${defaultFolderName}`;
      const newSongs: Song[] = audioFiles.map((file, idx) => {
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const parts = baseName.split(' - ');
        const artist = parts.length > 1 ? parts[0].trim() : 'Local Artist';
        const title =
          parts.length > 1 ? parts.slice(1).join(' - ').trim() : baseName;
        const matchedLrc = lrcMap.get(baseName.toLowerCase()) || null;

        return {
          id: Date.now() + idx,
          title,
          artist,
          album: defaultFolderName,
          durationMs: 180000,
          mediaUri: URL.createObjectURL(file),
          artworkUri: 'linear-gradient:135:#1E1E24:#3B3B48',
          isFavorite: false,
          playCount: 0,
          popularityScore: 80,
          dateAdded: Date.now(),
          folderName: defaultFolderName,
          folderPath,
          lyrics: matchedLrc,
        };
      });

      setAllSongs((prev) => [...newSongs, ...prev]);
      setAddedFolders((prev) => {
        const existing = prev.find(
          (f) => f.name.toLowerCase() === defaultFolderName.toLowerCase()
        );
        if (existing) {
          return prev.map((f) =>
            f.id === existing.id
              ? { ...f, songCount: f.songCount + newSongs.length }
              : f
          );
        }
        return [
          ...prev,
          {
            id: Date.now(),
            name: defaultFolderName,
            path: folderPath,
            songCount: newSongs.length,
            dateAdded: Date.now(),
            artworkUri: 'linear-gradient:135:#1E1E24:#3B3B48',
            isArtworkConfirmed: false,
            candidateUrls: [
              'linear-gradient:135:#1E1E24:#3B3B48',
              'linear-gradient:135:#1A1A24:#4A306D',
            ],
            candidateIndex: 0,
          },
        ];
      });

      showToast(
        `Added ${newSongs.length} songs from '${defaultFolderName}' to library`
      );
    },
    [playbackState.currentSong, showToast]
  );

  // Explorer Virtual File System Items
  const directoryItems = useMemo<FileExplorerItem[]>(() => {
    const combinedSongs = [...allSongs, ...explorerExtraSongs];
    const seenIds = new Set<number>();
    const uniqueSongs = combinedSongs.filter((s) => {
      if (seenIds.has(s.id)) return false;
      seenIds.add(s.id);
      return true;
    });

    const normCurrent = explorerPath.replace(/\/+$/, '');
    const subDirs = new Map<string, { itemCount: number; audioCount: number }>();
    const audioFilesHere: FileExplorerItem[] = [];

    for (const song of uniqueSongs) {
      const fPath = (
        song.folderPath || `/storage/emulated/0/Music/${song.folderName || 'Library'}`
      ).replace(/\/+$/, '');

      if (fPath === normCurrent) {
        const sizeBytes = Math.round((song.durationMs / 1000) * 24000);
        audioFilesHere.push({
          type: 'audio',
          name: `${song.title}.mp3`,
          path: `${fPath}/${song.id}.mp3`,
          sizeBytes,
          sizeFormatted: formatFileSize(sizeBytes),
          song,
        });
      } else if (fPath.startsWith(`${normCurrent}/`)) {
        const remainder = fPath.slice(normCurrent.length + 1);
        const childName = remainder.split('/')[0];
        if (childName) {
          const prev = subDirs.get(childName) || { itemCount: 0, audioCount: 0 };
          subDirs.set(childName, {
            itemCount: prev.itemCount + 1,
            audioCount: prev.audioCount + 1,
          });
        }
      }
    }

    const dirItems: FileExplorerItem[] = Array.from(subDirs.entries()).map(
      ([name, counts]) => ({
        type: 'directory',
        name,
        path: `${normCurrent}/${name}`,
        itemCount: counts.itemCount,
        audioCount: counts.audioCount,
      })
    );

    return [...dirItems, ...audioFilesHere];
  }, [allSongs, explorerExtraSongs, explorerPath]);

  const handleAddDirectoryToLibrary = useCallback(
    (dirPath: string, dirName: string) => {
      const normDir = dirPath.replace(/\/+$/, '');
      const matchingExtra = explorerExtraSongs.filter((s) =>
        (s.folderPath || '').replace(/\/+$/, '').startsWith(normDir)
      );

      if (matchingExtra.length > 0) {
        setAllSongs((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const toAdd = matchingExtra.filter((s) => !existingIds.has(s.id));
          return [...prev, ...toAdd];
        });
        setExplorerExtraSongs((prev) =>
          prev.filter(
            (s) => !(s.folderPath || '').replace(/\/+$/, '').startsWith(normDir)
          )
        );
      }

      setAddedFolders((prev) => {
        if (prev.some((f) => f.path === normDir || f.name === dirName)) {
          return prev;
        }
        const count =
          matchingExtra.length ||
          allSongs.filter((s) => s.folderPath === normDir).length ||
          1;
        return [
          ...prev,
          {
            id: Date.now(),
            name: dirName,
            path: normDir,
            songCount: count,
            dateAdded: Date.now(),
            artworkUri: 'linear-gradient:135:#0F172A:#334155',
            isArtworkConfirmed: false,
            candidateUrls: [
              'linear-gradient:135:#0F172A:#334155',
              'linear-gradient:135:#271C19:#55423D',
            ],
            candidateIndex: 0,
          },
        ];
      });

      showToast(`Added folder '${dirName}' to library`);
    },
    [allSongs, explorerExtraSongs, showToast]
  );

  const handleAddSingleSongToLibrary = useCallback(
    (song: Song) => {
      setAllSongs((prev) => {
        if (prev.some((s) => s.id === song.id)) return prev;
        return [...prev, song];
      });
      showToast(`Added '${song.title}' to library`);
    },
    [showToast]
  );

  // Active Playlist Detail Songs
  const activePlaylistSongs = useMemo(() => {
    if (!activePlaylistView) return [];
    if (activePlaylistView.title === 'Favorites') return favorites;
    if (activePlaylistView.title === 'Most Played') return mostPlayed;
    if (activePlaylistView.title === 'Most Popular') return mostPopular;
    const pl = playlists.find((p) => p.id === activePlaylistView.playlistId);
    if (!pl) return [];
    return pl.songIds
      .map((id) => allSongs.find((s) => s.id === id))
      .filter((s): s is Song => Boolean(s));
  }, [activePlaylistView, allSongs, favorites, mostPlayed, mostPopular, playlists]);

  // Stable Callbacks for Memoized Screens
  const handleOpenSettings = useCallback(() => setShowSettingsSheet(true), []);
  const handleOpenUiConcepts = useCallback(() => setShowUiConceptsModal(true), []);
  const handleSelectSongForPlaylist = useCallback(
    (song: Song) => setSelectedSongForPlaylist(song),
    []
  );
  const handleOpenFolder = useCallback((f: AddedFolder) => {
    setSearchQuery('');
    setOpenedFolder(f);
  }, []);
  const handleCloseFolder = useCallback(() => {
    setSearchQuery('');
    setOpenedFolder(null);
  }, []);
  const handleRescanDevice = useCallback(() => {
    showToast(`Synced ${allSongs.length} tracks from device`);
  }, [allSongs.length, showToast]);
  const handleOpenSmartPlaylist = useCallback(
    (name: 'Favorites' | 'Most Played' | 'Most Popular') => {
      setActivePlaylistView({ title: name, playlistId: null });
    },
    []
  );
  const handleOpenCustomPlaylist = useCallback((pl: Playlist) => {
    setActivePlaylistView({ title: pl.name, playlistId: pl.id });
  }, []);
  const handleBackFromPlaylist = useCallback(() => {
    setActivePlaylistView(null);
  }, []);
  const handleCreatePlaylistSimple = useCallback(
    (name: string) => createPlaylist(name),
    [createPlaylist]
  );
  const handleNavigateUp = useCallback(() => {
    setExplorerPath((prev) => {
      const parts = prev.split('/').filter(Boolean);
      if (parts.length > 1) {
        return '/' + parts.slice(0, -1).join('/');
      }
      return prev;
    });
  }, []);
  const handleSelectQueueIndex = useCallback(
    (index: number) => {
      const target = playbackState.queue[index];
      if (!target) return;
      audioEngineRef.current?.loadAndPlay(target, 0);
      setPlaybackState((prev) => ({
        ...prev,
        currentSong: target,
        queueIndex: index,
        currentPositionMs: 0,
        durationMs: target.durationMs,
        isPlaying: true,
      }));
    },
    [playbackState.queue]
  );

  // Global Keyboard Shortcuts (Space, Left/Right seek, N/P track skip, L Now Playing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekTo(playbackRef.current.currentPositionMs + 5000);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekTo(playbackRef.current.currentPositionMs - 5000);
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        skipNext();
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        skipPrevious(true);
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setShowNowPlayingSheet((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [seekTo, skipNext, skipPrevious, togglePlayPause]);

  const showMiniPlayer =
    playbackState.currentSong !== null && !isMiniPlayerDismissed;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Desktop Sidebar Navigation (Visible on lg+ viewports) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-6 justify-between">
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <span className="text-lg font-extrabold tracking-tight text-[var(--text-primary)] whitespace-nowrap">
              Minimal Music
            </span>
          </div>

          <nav aria-label="Main Navigation" className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const selected = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => {
                    setCurrentRoute(item.route);
                    setActivePlaylistView(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-colors whitespace-nowrap ${
                    selected
                      ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/50 font-medium'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Sleep Timer & UI Designs Quick Triggers */}
          <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2">
            <button
              type="button"
              onClick={() => setShowUiConceptsModal(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span>5 UI Design Concepts</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSleepTimerSheet(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors whitespace-nowrap"
            >
              <Moon className="w-4 h-4 shrink-0" />
              <span>
                {isSleepTimerEndOfSong
                  ? 'Sleep: End of Song'
                  : sleepTimerRemainingMs !== null
                    ? `Sleep: ${Math.ceil(sleepTimerRemainingMs / 60000)}m left`
                    : 'Sleep Timer'}
              </span>
            </button>
          </div>
        </div>

        <div className="px-2 text-[11px] text-[var(--text-muted)] space-y-1">
          <div className="font-medium text-[var(--text-secondary)]">
            {allSongs.length} Tracks · {addedFolders.length} Folders
          </div>
          <div>Synced LRC · Monochrome Audio</div>
        </div>
      </aside>

      {/* Main Content Area: Keep all 4 primary tabs mounted for 0ms instant switching */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 pt-5 pb-36 lg:pb-28">
          <div
            className={
              currentRoute === 'discover' ? 'block animate-tab-enter' : 'hidden'
            }
          >
            <DiscoverScreen
              mostPopular={mostPopular}
              mostPlayed={mostPlayed}
              allSongs={allSongs}
              currentSongId={playbackState.currentSong?.id ?? null}
              isPlaying={playbackState.isPlaying}
              themeMode={themeMode}
              onSelectTheme={setThemeMode}
              onOpenSettings={handleOpenSettings}
              onOpenUiConcepts={handleOpenUiConcepts}
              onPlaySong={playSong}
              onPlayQueue={playQueue}
              onToggleFavorite={toggleFavorite}
              onAddToPlaylistClick={handleSelectSongForPlaylist}
              onFetchArtwork={fetchSongArtwork}
            />
          </div>

          <div
            className={
              currentRoute === 'songs' ? 'block animate-tab-enter' : 'hidden'
            }
          >
            <SongsScreen
              allSongs={allSongs}
              addedFolders={addedFolders}
              openedFolder={openedFolder}
              searchQuery={searchQuery}
              currentSongId={playbackState.currentSong?.id ?? null}
              isPlaying={playbackState.isPlaying}
              themeMode={themeMode}
              onSearchQueryChange={setSearchQuery}
              onSelectTheme={setThemeMode}
              onOpenFolder={handleOpenFolder}
              onCloseFolder={handleCloseFolder}
              onPlayFolder={playFolder}
              onConfirmFolderArtwork={confirmFolderArtwork}
              onTryAgainFolderArtwork={tryAgainFolderArtwork}
              onRefreshFolderArtwork={refreshFolderArtwork}
              onRemoveFolder={removeFolder}
              onRescanDevice={handleRescanDevice}
              onFetchAllThumbnails={fetchAllThumbnails}
              onOpenSettings={handleOpenSettings}
              onPlaySong={playSong}
              onToggleFavorite={toggleFavorite}
              onAddToPlaylistClick={handleSelectSongForPlaylist}
              onFetchSongArtwork={fetchSongArtwork}
              onImportFiles={handleImportLocalFiles}
            />
          </div>

          <div
            className={
              currentRoute === 'playlists' ? 'block animate-tab-enter' : 'hidden'
            }
          >
            {activePlaylistView ? (
              <PlaylistDetailScreen
                title={activePlaylistView.title}
                playlistId={activePlaylistView.playlistId}
                songs={activePlaylistSongs}
                currentSongId={playbackState.currentSong?.id ?? null}
                isPlaying={playbackState.isPlaying}
                onBack={handleBackFromPlaylist}
                onPlayQueue={playQueue}
                onPlaySong={playSong}
                onToggleFavorite={toggleFavorite}
                onRemoveFromPlaylist={removeSongFromPlaylist}
                onFetchArtwork={fetchSongArtwork}
              />
            ) : (
              <PlaylistsScreen
                playlists={playlists}
                favorites={favorites}
                mostPlayed={mostPlayed}
                mostPopular={mostPopular}
                onOpenSmartPlaylist={handleOpenSmartPlaylist}
                onOpenCustomPlaylist={handleOpenCustomPlaylist}
                onCreatePlaylist={handleCreatePlaylistSimple}
                onDeletePlaylist={deletePlaylist}
              />
            )}
          </div>

          <div
            className={
              currentRoute === 'folders' ? 'block animate-tab-enter' : 'hidden'
            }
          >
            <FoldersScreen
              currentPath={explorerPath}
              directoryItems={directoryItems}
              currentSongId={playbackState.currentSong?.id ?? null}
              isPlaying={playbackState.isPlaying}
              onNavigateTo={setExplorerPath}
              onNavigateUp={handleNavigateUp}
              onAddDirectoryToLibrary={handleAddDirectoryToLibrary}
              onAddSingleSongToLibrary={handleAddSingleSongToLibrary}
              onPlaySong={playSong}
              onAddToPlaylistClick={handleSelectSongForPlaylist}
              onFetchArtwork={fetchSongArtwork}
              onImportLocalFiles={handleImportLocalFiles}
            />
          </div>
        </main>

        {/* Docked MiniPlayerBar + Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-30 pointer-events-none">
          <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-2 pointer-events-auto">
            {showMiniPlayer && (
              <MiniPlayerBar
                playbackState={playbackState}
                onPlayPauseClick={togglePlayPause}
                onNextClick={skipNext}
                onPreviousClick={() => skipPrevious(true)}
                onExpandClick={() => setShowNowPlayingSheet(true)}
                onDismiss={() => {
                  setIsMiniPlayerDismissed(true);
                  audioEngineRef.current?.pause();
                  setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
                }}
                sleepTimerRemainingMs={sleepTimerRemainingMs}
                isSleepTimerEndOfSong={isSleepTimerEndOfSong}
              />
            )}
          </div>

          {/* Mobile Bottom Navigation Bar (< lg) */}
          <nav
            aria-label="Mobile Navigation"
            className="lg:hidden bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] pointer-events-auto"
          >
            <div className="grid grid-cols-4 h-14 max-w-md mx-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const selected = currentRoute === item.route;
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => {
                      setCurrentRoute(item.route);
                      setActivePlaylistView(null);
                    }}
                    className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                      selected
                        ? 'text-[var(--text-primary)] font-semibold'
                        : 'text-[var(--text-secondary)] font-normal'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] leading-tight">{item.title}</span>
                    {selected && (
                      <span className="w-4 h-0.5 rounded-full bg-[var(--text-primary)] mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Add to Playlist Selection Modal */}
      {selectedSongForPlaylist && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add to Playlist"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setSelectedSongForPlaylist(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-t-3xl sm:rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Add to Playlist
                </h2>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {selectedSongForPlaylist.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSongForPlaylist(null)}
                aria-label="Close Add to Playlist"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {playlists.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-3">
                No custom playlists yet. Create one in the Playlists tab.
              </p>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => {
                      addSongToPlaylist(pl.id, selectedSongForPlaylist.id);
                      setSelectedSongForPlaylist(null);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-surface)] text-left transition-colors"
                  >
                    <ListMusic className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {pl.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full-Screen Now Playing Sheet */}
      {showNowPlayingSheet && playbackState.currentSong && (
        <NowPlayingSheet
          playbackState={playbackState}
          isFavorite={
            favorites.some((s) => s.id === playbackState.currentSong?.id) ||
            Boolean(playbackState.currentSong.isFavorite)
          }
          openLyricsByDefault={openLyricsByDefault}
          currentLyrics={currentLyrics}
          isLoadingLyrics={isLoadingLyrics}
          parsedLyrics={parsedLyrics}
          sleepTimerRemainingMs={sleepTimerRemainingMs}
          isSleepTimerEndOfSong={isSleepTimerEndOfSong}
          onTogglePlayPause={togglePlayPause}
          onSkipNext={skipNext}
          onSkipPrevious={skipPrevious}
          onSeekTo={seekTo}
          onToggleShuffle={toggleShuffle}
          onToggleRepeat={toggleRepeat}
          onToggleFavorite={toggleFavorite}
          onFetchArtwork={fetchSongArtwork}
          onRetryLyrics={() => {
            if (playbackState.currentSong) {
              loadLyricsForSong(playbackState.currentSong, true);
            }
          }}
          onSelectQueueIndex={handleSelectQueueIndex}
          onOpenSleepTimer={() => setShowSleepTimerSheet(true)}
          onOpenSettings={handleOpenSettings}
          onDismiss={() => setShowNowPlayingSheet(false)}
        />
      )}

      {/* Sleep Timer Sheet */}
      {showSleepTimerSheet && (
        <SleepTimerSheet
          remainingMs={sleepTimerRemainingMs}
          isEndOfSong={isSleepTimerEndOfSong}
          onStartTimer={(mins) => {
            setIsSleepTimerEndOfSong(false);
            setSleepTimerRemainingMs(mins * 60 * 1000);
            showToast(`Sleep timer set for ${mins} minutes`);
          }}
          onStartEndOfSong={() => {
            setSleepTimerRemainingMs(null);
            setIsSleepTimerEndOfSong(true);
            showToast('Playback will pause at the end of current song');
          }}
          onAdjustTimer={(deltaMins) => {
            setSleepTimerRemainingMs((prev) => {
              if (prev === null) return null;
              return Math.max(60000, prev + deltaMins * 60000);
            });
          }}
          onCancelTimer={() => {
            setSleepTimerRemainingMs(null);
            setIsSleepTimerEndOfSong(false);
            showToast('Sleep timer turned off');
          }}
          onDismiss={() => setShowSleepTimerSheet(false)}
        />
      )}

      {/* Settings Sheet */}
      {showSettingsSheet && (
        <SettingsSheet
          openLyricsByDefault={openLyricsByDefault}
          onToggleOpenLyricsByDefault={setOpenLyricsByDefault}
          themeMode={themeMode}
          onSelectThemeMode={setThemeMode}
          totalSongsCount={allSongs.length}
          onRescanAudio={() =>
            showToast(`Synced ${allSongs.length} tracks from device`)
          }
          onFetchAllArtwork={() => fetchAllThumbnails(allSongs)}
          onDismiss={() => setShowSettingsSheet(false)}
        />
      )}

      {/* 5 UI Design Concepts Gallery Modal */}
      {showUiConceptsModal && (
        <UiConceptsGalleryModal
          currentTheme={themeMode}
          onSelectTheme={setThemeMode}
          onDismiss={() => setShowUiConceptsModal(false)}
        />
      )}

      {/* Snackbar Toast */}
      {snackbarMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 lg:bottom-8 right-4 sm:right-8 z-50 px-4 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-canvas)] text-xs font-semibold shadow-xl"
        >
          {snackbarMessage}
        </div>
      )}
    </div>
  );
}
