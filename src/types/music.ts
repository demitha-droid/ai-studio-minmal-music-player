export type ThemeMode = 'DARK' | 'AMOLED' | 'LIGHT';

export const THEME_LABELS: Record<ThemeMode, string> = {
  DARK: 'Obsidian Dark',
  AMOLED: 'Pure Black AMOLED',
  LIGHT: 'Minimal Light',
};

export type RepeatMode = 'OFF' | 'ALL' | 'ONE';

export type ScreenRoute = 'discover' | 'songs' | 'playlists' | 'folders';

export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  mediaUri: string;
  artworkUri?: string | null;
  isFavorite: boolean;
  playCount: number;
  popularityScore: number;
  dateAdded: number;
  folderName?: string | null;
  folderPath?: string | null;
  lyrics?: string | null;
  /** Synth signature for deterministic Web Audio playback when no external blob is loaded */
  synthProfile?: {
    rootFreq: number;
    chordRatios: number[];
    tempoBpm: number;
    waveform: OscillatorType;
  };
}

export interface AddedFolder {
  id: number;
  name: string;
  path: string;
  songCount: number;
  dateAdded: number;
  artworkUri?: string | null;
  isArtworkConfirmed: boolean;
  candidateUrls: string[];
  candidateIndex: number;
}

export interface Playlist {
  id: number;
  name: string;
  createdAt: number;
  songIds: number[];
}

export interface PlaybackState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentPositionMs: number;
  durationMs: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Song[];
  queueIndex: number;
}

export interface LyricLine {
  timeMs: number; // -1 if unsynced plain lyric
  text: string;
}

export interface ParsedLyrics {
  isSynced: boolean;
  lines: LyricLine[];
  rawText: string;
}

export interface FileExplorerDirectory {
  type: 'directory';
  name: string;
  path: string;
  itemCount: number;
  audioCount: number;
}

export interface FileExplorerAudio {
  type: 'audio';
  name: string;
  path: string;
  sizeBytes: number;
  sizeFormatted: string;
  song: Song;
}

export type FileExplorerItem = FileExplorerDirectory | FileExplorerAudio;
