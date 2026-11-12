import {
  AddedFolder,
  LyricLine,
  ParsedLyrics,
  PlaybackState,
  RepeatMode,
  Song,
} from '../types/music';

/**
 * Formats milliseconds into m:ss (matching Song.formattedDuration & NowPlayingSheet.formatTime)
 */
export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formats byte count into human-readable file size (matching FileExplorerHelper)
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

/**
 * Computes playback progress clamped between 0 and 1 (matching PlaybackState.progress)
 */
export function calculateProgress(currentPositionMs: number, durationMs: number): number {
  if (durationMs <= 0) return 0;
  const ratio = currentPositionMs / durationMs;
  return Math.max(0, Math.min(1, ratio));
}

/**
 * Cycles repeat mode OFF -> ALL -> ONE -> OFF
 */
export function nextRepeatMode(current: RepeatMode): RepeatMode {
  if (current === 'OFF') return 'ALL';
  if (current === 'ALL') return 'ONE';
  return 'OFF';
}

const TIMESTAMP_GLOBAL_REGEX = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
const TIMESTAMP_SINGLE_REGEX = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/;

/**
 * Parses an LRC formatted string or plain text lyrics into structured ParsedLyrics
 * (port of LyricsHelper.parseLyrics from Minimal Music Player)
 */
export function parseLyrics(raw?: string | null): ParsedLyrics {
  if (!raw || !raw.trim()) {
    return { isSynced: false, lines: [], rawText: '' };
  }

  const rawLines = raw.split(/\r?\n/);
  const parsedLines: LyricLine[] = [];
  let foundTimestamp = false;

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip standard LRC metadata tags
    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith('[ti:') ||
      lower.startsWith('[ar:') ||
      lower.startsWith('[al:') ||
      lower.startsWith('[by:') ||
      lower.startsWith('[offset:') ||
      lower.startsWith('[re:') ||
      lower.startsWith('[ve:') ||
      lower.startsWith('[length:')
    ) {
      continue;
    }

    const matches = Array.from(trimmed.matchAll(TIMESTAMP_GLOBAL_REGEX));
    if (matches.length > 0) {
      foundTimestamp = true;
      const lyricText = trimmed.replace(TIMESTAMP_GLOBAL_REGEX, '').trim();

      for (const match of matches) {
        const minutes = parseInt(match[1] || '0', 10) || 0;
        const seconds = parseInt(match[2] || '0', 10) || 0;
        const msGroup = match[3] || '';
        let ms = 0;
        if (msGroup.length === 1) {
          ms = (parseInt(msGroup, 10) || 0) * 100;
        } else if (msGroup.length === 2) {
          ms = (parseInt(msGroup, 10) || 0) * 10;
        } else if (msGroup.length === 3) {
          ms = parseInt(msGroup, 10) || 0;
        }
        const totalMs = minutes * 60_000 + seconds * 1000 + ms;
        parsedLines.push({ timeMs: totalMs, text: lyricText });
      }
    } else if (!foundTimestamp && !TIMESTAMP_SINGLE_REGEX.test(trimmed)) {
      parsedLines.push({ timeMs: -1, text: trimmed });
    }
  }

  if (foundTimestamp) {
    const sorted = parsedLines
      .filter((l) => l.timeMs >= 0)
      .sort((a, b) => a.timeMs - b.timeMs);
    return { isSynced: true, lines: sorted, rawText: raw };
  }

  return { isSynced: false, lines: parsedLines, rawText: raw };
}

/**
 * Determines the currently active lyric line index based on playback position.
 * Uses a default leadOffsetMs of 450ms so lines highlight right at vocal onset.
 */
export function getCurrentLyricLineIndex(
  parsed: ParsedLyrics,
  positionMs: number,
  leadOffsetMs = 450
): number {
  if (!parsed.isSynced || parsed.lines.length === 0) return -1;
  const effectiveMs = positionMs + leadOffsetMs;
  let activeIndex = -1;
  for (let i = 0; i < parsed.lines.length; i++) {
    if (parsed.lines[i].timeMs <= effectiveMs) {
      activeIndex = i;
    } else {
      break;
    }
  }
  return activeIndex;
}

/**
 * Filters and deduplicates songs belonging to a given folder (port of SongsScreen & MusicViewModel folder matching)
 */
export function getSongsForFolder(allSongs: Song[], folder: AddedFolder): Song[] {
  const targetPath = folder.path.replace(/[/\\]+$/, '').toLowerCase();
  const folderNameLower = folder.name.trim().toLowerCase();

  const matched = allSongs.filter((song) => {
    const songPath = song.folderPath?.replace(/[/\\]+$/, '').toLowerCase() ?? null;
    const pathMatch =
      songPath !== null &&
      (songPath === targetPath ||
        songPath.startsWith(`${targetPath}/`) ||
        songPath.startsWith(`${targetPath}\\`));

    const songFolderName = song.folderName?.trim().toLowerCase() ?? '';
    const nameMatch =
      songFolderName.length > 0 &&
      songFolderName === folderNameLower &&
      (songPath === null || songPath.includes(folderNameLower));

    return pathMatch || nameMatch;
  });

  return deduplicateSongs(matched);
}

/**
 * Deduplicates songs by normalized title + artist + 2-second duration bucket
 */
export function deduplicateSongs(songs: Song[]): Song[] {
  const seen = new Set<string>();
  const result: Song[] = [];
  for (const song of songs) {
    const normTitle = song.title.trim().toLowerCase();
    const normArtist = song.artist.trim().toLowerCase();
    const durBucket = Math.floor(song.durationMs / 2000);
    const key = `${normTitle}::${normArtist}::${durBucket}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(song);
    }
  }
  return result;
}

/**
 * Computes next playback state when skipping to the next track
 */
export function computeSkipNext(state: PlaybackState): PlaybackState {
  if (state.queue.length === 0) return state;
  const nextIndex = (state.queueIndex + 1) % state.queue.length;
  const isWrapping = nextIndex === 0 && state.queueIndex === state.queue.length - 1;
  if (isWrapping && state.repeatMode === 'OFF' && state.queue.length > 1) {
    // Still wrap to first song on manual skipNext, matching ExoPlayer behavior
  }
  const nextSong = state.queue[nextIndex];
  return {
    ...state,
    currentSong: nextSong,
    queueIndex: nextIndex,
    currentPositionMs: 0,
    durationMs: nextSong.durationMs,
    isPlaying: true,
  };
}

/**
 * Computes previous playback state when skipping to the previous track
 * If > 3000ms into song and not forced, restarts current track; otherwise goes to previous track.
 */
export function computeSkipPrevious(state: PlaybackState, forcePrevious = false): PlaybackState {
  if (state.queue.length === 0) return state;
  if (!forcePrevious && state.currentPositionMs > 3000) {
    return {
      ...state,
      currentPositionMs: 0,
    };
  }
  const prevIndex =
    state.queueIndex > 0 ? state.queueIndex - 1 : state.queue.length - 1;
  const prevSong = state.queue[prevIndex];
  return {
    ...state,
    currentSong: prevSong,
    queueIndex: prevIndex,
    currentPositionMs: 0,
    durationMs: prevSong.durationMs,
    isPlaying: true,
  };
}

/**
 * Parses a linear-gradient artworkUri (e.g. "linear-gradient:45:#1A1A24:#4A306D") into a valid CSS gradient string
 */
export function resolveArtworkGradient(artworkUri?: string | null): string | null {
  if (!artworkUri || !artworkUri.startsWith('linear-gradient:')) return null;
  const parts = artworkUri.split(':');
  if (parts.length >= 4) {
    const deg = parts[1] || '45';
    const c1 = parts[2] || '#1A1A24';
    const c2 = parts[3] || '#4A306D';
    return `linear-gradient(${deg}deg, ${c1} 0%, ${c2} 100%)`;
  }
  return null;
}

/**
 * Extracts 2-letter uppercase initials for MinimalArtwork fallback
 */
export function getArtworkInitials(title: string): string {
  const cleaned = title.trim();
  if (!cleaned) return 'MM';
  return cleaned.slice(0, 2).toUpperCase();
}
