import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProgress,
  computeSkipNext,
  computeSkipPrevious,
  deduplicateSongs,
  formatDuration,
  formatFileSize,
  getArtworkInitials,
  getCurrentLyricLineIndex,
  getSongsForFolder,
  nextRepeatMode,
  parseLyrics,
  resolveArtworkGradient,
} from './musicLogic';
import { AddedFolder, PlaybackState, Song } from '../types/music';

test('formatDuration formats milliseconds accurately into m:ss', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(-500), '0:00');
  assert.equal(formatDuration(9000), '0:09');
  assert.equal(formatDuration(65000), '1:05');
  assert.equal(formatDuration(212000), '3:32');
});

test('formatFileSize formats bytes into B, KB, and MB', () => {
  assert.equal(formatFileSize(0), '0 B');
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(2048), '2.0 KB');
  assert.equal(formatFileSize(5 * 1024 * 1024), '5.0 MB');
});

test('calculateProgress clamps ratio between 0 and 1', () => {
  assert.equal(calculateProgress(0, 0), 0);
  assert.equal(calculateProgress(50000, 100000), 0.5);
  assert.equal(calculateProgress(150000, 100000), 1);
  assert.equal(calculateProgress(-1000, 100000), 0);
});

test('nextRepeatMode cycles OFF -> ALL -> ONE -> OFF', () => {
  assert.equal(nextRepeatMode('OFF'), 'ALL');
  assert.equal(nextRepeatMode('ALL'), 'ONE');
  assert.equal(nextRepeatMode('ONE'), 'OFF');
});

test('parseLyrics parses synced LRC timestamps and metadata tags', () => {
  const sampleLrc = `
[ti:Midnight Echoes]
[ar:Aether]
[00:04.50] Drifting through the obsidian night
[00:12.00] Neon reflections on quiet glass
[00:19.250] Every heartbeat in monochrome
  `;
  const parsed = parseLyrics(sampleLrc);
  assert.equal(parsed.isSynced, true);
  assert.equal(parsed.lines.length, 3);
  assert.equal(parsed.lines[0].timeMs, 4500);
  assert.equal(parsed.lines[0].text, 'Drifting through the obsidian night');
  assert.equal(parsed.lines[1].timeMs, 12000);
  assert.equal(parsed.lines[2].timeMs, 19250);
});

test('parseLyrics handles plain unsynced lyrics', () => {
  const plain = 'First verse line\nSecond verse line';
  const parsed = parseLyrics(plain);
  assert.equal(parsed.isSynced, false);
  assert.equal(parsed.lines.length, 2);
  assert.equal(parsed.lines[0].timeMs, -1);
  assert.equal(parsed.lines[1].text, 'Second verse line');
});

test('getCurrentLyricLineIndex applies 450ms vocal onset lead offset', () => {
  const parsed = parseLyrics('[00:05.00] Line One\n[00:10.00] Line Two');
  // At 4600ms + 450ms = 5050ms -> should already highlight Line One (index 0)
  assert.equal(getCurrentLyricLineIndex(parsed, 4600), 0);
  // At 4000ms + 450ms = 4450ms -> before Line One (-1)
  assert.equal(getCurrentLyricLineIndex(parsed, 4000), -1);
  // At 9800ms + 450ms = 10250ms -> should highlight Line Two (index 1)
  assert.equal(getCurrentLyricLineIndex(parsed, 9800), 1);
});

test('deduplicateSongs and getSongsForFolder remove duplicate entries', () => {
  const s1: Song = {
    id: 1,
    title: 'Midnight Echoes',
    artist: 'Aether',
    album: 'Nocturne',
    durationMs: 212000,
    mediaUri: 'track1.mp3',
    isFavorite: true,
    playCount: 10,
    popularityScore: 90,
    dateAdded: 1000,
    folderName: 'Featured Music',
    folderPath: 'FEATURED_MUSIC',
  };
  const s1Dup: Song = { ...s1, id: 2, durationMs: 212500 };
  const folder: AddedFolder = {
    id: 10,
    name: 'Featured Music',
    path: 'FEATURED_MUSIC',
    songCount: 2,
    dateAdded: 1000,
    isArtworkConfirmed: true,
    candidateUrls: [],
    candidateIndex: 0,
  };

  const deduped = deduplicateSongs([s1, s1Dup]);
  assert.equal(deduped.length, 1);

  const folderTracks = getSongsForFolder([s1, s1Dup], folder);
  assert.equal(folderTracks.length, 1);
  assert.equal(folderTracks[0].id, 1);
});

test('computeSkipNext and computeSkipPrevious transition queue accurately', () => {
  const queue: Song[] = [
    {
      id: 1,
      title: 'Song A',
      artist: 'Artist A',
      album: '',
      durationMs: 180000,
      mediaUri: 'a.mp3',
      isFavorite: false,
      playCount: 0,
      popularityScore: 50,
      dateAdded: 1,
    },
    {
      id: 2,
      title: 'Song B',
      artist: 'Artist B',
      album: '',
      durationMs: 200000,
      mediaUri: 'b.mp3',
      isFavorite: false,
      playCount: 0,
      popularityScore: 60,
      dateAdded: 2,
    },
  ];

  const initial: PlaybackState = {
    currentSong: queue[0],
    isPlaying: true,
    currentPositionMs: 5000,
    durationMs: 180000,
    isShuffle: false,
    repeatMode: 'OFF',
    queue,
    queueIndex: 0,
  };

  // Skip previous when >3000ms and forcePrevious=false restarts current track
  const restarted = computeSkipPrevious(initial, false);
  assert.equal(restarted.queueIndex, 0);
  assert.equal(restarted.currentPositionMs, 0);

  // Skip previous with forcePrevious=true wraps to last song
  const wrappedPrev = computeSkipPrevious(initial, true);
  assert.equal(wrappedPrev.queueIndex, 1);
  assert.equal(wrappedPrev.currentSong?.id, 2);

  // Skip next moves to index 1
  const nextState = computeSkipNext(initial);
  assert.equal(nextState.queueIndex, 1);
  assert.equal(nextState.currentSong?.id, 2);
});

test('resolveArtworkGradient and getArtworkInitials', () => {
  assert.equal(
    resolveArtworkGradient('linear-gradient:45:#1A1A24:#4A306D'),
    'linear-gradient(45deg, #1A1A24 0%, #4A306D 100%)'
  );
  assert.equal(resolveArtworkGradient('https://example.com/art.jpg'), null);
  assert.equal(getArtworkInitials('Midnight Echoes'), 'MI');
});
