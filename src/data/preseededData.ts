import { AddedFolder, Playlist, Song } from '../types/music';

export const PRESEEDED_TRACKS: Song[] = [
  {
    id: 1001,
    title: 'Midnight Echoes',
    artist: 'Aether',
    album: 'Nocturne Chronicles',
    durationMs: 212000,
    mediaUri: 'synth://midnight-echoes',
    artworkUri: 'linear-gradient:45:#1A1A24:#4A306D',
    isFavorite: true,
    playCount: 42,
    popularityScore: 98,
    dateAdded: Date.now() - 86400000 * 7,
    folderName: 'Featured Music',
    folderPath: '/storage/emulated/0/Music/Featured Music',
    synthProfile: {
      rootFreq: 220.0, // A3 minor
      chordRatios: [1, 1.2, 1.5, 1.8],
      tempoBpm: 84,
      waveform: 'sine',
    },
    lyrics: `[ti:Midnight Echoes]
[ar:Aether]
[al:Nocturne Chronicles]
[00:00.00] ⋯ Instrumental Intro (Obsidian Synth Pad) ⋯
[00:04.50] Walking through the quiet streets of glass and rain
[00:10.20] Every shadow hums a silver refrain
[00:16.80] Streetlights flicker in a monochrome haze
[00:23.40] Counting all the echoes of our sleepless days
[00:30.00] Midnight echoes calling from the other side
[00:37.50] Underneath the static where the memories hide
[00:45.00] Breathe into the silence, let the frequencies align
[00:53.20] Lost inside the rhythm of a slower time
[01:02.00] ⋯ Sub-Bass & Arpeggio Interlude ⋯
[01:14.00] Cold horizon fading into velvet black
[01:22.50] Signals in the wire never looking back
[01:31.00] Midnight echoes calling from the other side
[01:40.00] Underneath the static where the memories hide
[01:50.00] Let the last chord linger in the empty room
[02:02.00] Fading out softly beneath a paper moon`,
  },
  {
    id: 1002,
    title: 'Solar Drift',
    artist: 'Komorebi',
    album: 'Horizon Light',
    durationMs: 184000,
    mediaUri: 'synth://solar-drift',
    artworkUri: 'linear-gradient:45:#182026:#2A4B5E',
    isFavorite: false,
    playCount: 37,
    popularityScore: 95,
    dateAdded: Date.now() - 86400000 * 6,
    folderName: 'Featured Music',
    folderPath: '/storage/emulated/0/Music/Featured Music',
    synthProfile: {
      rootFreq: 261.63, // C4 major 7
      chordRatios: [1, 1.25, 1.5, 1.875],
      tempoBpm: 92,
      waveform: 'triangle',
    },
    lyrics: `[ti:Solar Drift]
[ar:Komorebi]
[al:Horizon Light]
[00:00.00] ⋯ Warm Analog Tape Intro ⋯
[00:05.00] Golden dust suspended in the morning air
[00:11.50] Sunlight filtering through cedar leaves so fair
[00:18.20] Drifting weightless over quiet coastal tides
[00:25.80] Where the ocean mirror meets the mountainside
[00:33.50] Solar drift, carry me across the blue
[00:41.00] Every horizon opening a clearer view
[00:49.50] No more hurry in the turning of the sphere
[00:58.00] Only light and stillness resting here
[01:08.00] ⋯ Shimmering Rhodes Solo ⋯
[01:22.00] Watch the amber currents slowly intertwine
[01:32.00] Solar drift, carry me across the blue
[01:42.00] Floating gently till the day is new`,
  },
  {
    id: 1003,
    title: 'Velvet Skyline',
    artist: 'Sora & Mira',
    album: 'Dusk Sessions',
    durationMs: 238000,
    mediaUri: 'synth://velvet-skyline',
    artworkUri: 'linear-gradient:45:#21141E:#5E2442',
    isFavorite: true,
    playCount: 29,
    popularityScore: 91,
    dateAdded: Date.now() - 86400000 * 5,
    folderName: 'Featured Music',
    folderPath: '/storage/emulated/0/Music/Featured Music',
    synthProfile: {
      rootFreq: 196.0, // G3
      chordRatios: [1, 1.2, 1.5, 1.78],
      tempoBpm: 78,
      waveform: 'sine',
    },
    lyrics: `[ti:Velvet Skyline]
[ar:Sora & Mira]
[al:Dusk Sessions]
[00:00.00] ⋯ Dusk Electric Piano Intro ⋯
[00:06.00] Rooftops painted in a deep magenta glow
[00:13.00] Traffic rivers winding silently below
[00:20.50] Coffee steam rising in the twilight chill
[00:28.00] For a fleeting moment all the world is still
[00:36.00] On this velvet skyline we can watch the stars awake
[00:44.50] Every quiet promise that the evening makes
[00:53.00] Hold the static gentle on the FM dial
[01:02.00] Stay above the city for a little while`,
  },
  {
    id: 1004,
    title: 'Neon Mirage',
    artist: 'CyberPulse',
    album: 'Synthetic Dreams',
    durationMs: 196000,
    mediaUri: 'synth://neon-mirage',
    artworkUri: 'linear-gradient:45:#111B24:#1C5870',
    isFavorite: false,
    playCount: 21,
    popularityScore: 88,
    dateAdded: Date.now() - 86400000 * 4,
    folderName: 'Nocturnal Synthwave',
    folderPath: '/storage/emulated/0/Music/Nocturnal Synthwave',
    synthProfile: {
      rootFreq: 164.81, // E3
      chordRatios: [1, 1.2, 1.5, 2.0],
      tempoBpm: 108,
      waveform: 'sawtooth',
    },
    lyrics: `[ti:Neon Mirage]
[ar:CyberPulse]
[al:Synthetic Dreams]
[00:00.00] ⋯ Arpeggiated Bassline Pulse ⋯
[00:04.80] Chrome reflections racing down the expressway
[00:11.20] Chasing digital horizons far away
[00:18.00] Outrun shadows in the rear-view mirror light
[00:25.00] Neon mirage burning through the endless night
[00:33.00] Binary heartbeat locked in overdrive
[00:41.50] Underneath the grid is where we come alive`,
  },
  {
    id: 1005,
    title: 'Cerulean Waves',
    artist: 'Deep Cascade',
    album: 'Submerged',
    durationMs: 245000,
    mediaUri: 'synth://cerulean-waves',
    artworkUri: 'linear-gradient:45:#0F1D1A:#1E4B3E',
    isFavorite: false,
    playCount: 18,
    popularityScore: 84,
    dateAdded: Date.now() - 86400000 * 3,
    folderName: 'Lo-Fi Study Tapes',
    folderPath: '/storage/emulated/0/Music/Lo-Fi Study Tapes',
    synthProfile: {
      rootFreq: 174.61, // F3
      chordRatios: [1, 1.25, 1.5, 1.875],
      tempoBpm: 72,
      waveform: 'sine',
    },
    lyrics: `[ti:Cerulean Waves]
[ar:Deep Cascade]
[al:Submerged]
[00:00.00] ⋯ Deep Ocean Ambient Wash ⋯
[00:07.00] Sinking slowly through cerulean degrees
[00:15.00] Coral canyons swaying in the undertow breeze
[00:23.00] Pressure fades away into a weightless calm
[00:31.50] Cool and quiet water like a healing balm
[00:40.00] Let the tide carry every thought to sea`,
  },
  {
    id: 1006,
    title: 'Golden Hour Whispers',
    artist: 'Solstice',
    album: 'Quiet Glow',
    durationMs: 168000,
    mediaUri: 'synth://golden-hour-whispers',
    artworkUri: 'linear-gradient:45:#261E14:#6B4E26',
    isFavorite: true,
    playCount: 15,
    popularityScore: 80,
    dateAdded: Date.now() - 86400000 * 2,
    folderName: 'Lo-Fi Study Tapes',
    folderPath: '/storage/emulated/0/Music/Lo-Fi Study Tapes',
    synthProfile: {
      rootFreq: 293.66, // D4
      chordRatios: [1, 1.25, 1.5, 1.667],
      tempoBpm: 80,
      waveform: 'triangle',
    },
    lyrics: `[ti:Golden Hour Whispers]
[ar:Solstice]
[al:Quiet Glow]
[00:00.00] ⋯ Acoustic Lo-Fi Vinyl Crackle ⋯
[00:04.20] Amber shadows stretching across wooden floors
[00:10.80] Summer wind knocking softly at the doors
[00:17.50] Golden hour whispers in a familiar tone
[00:24.50] Peace inside the quiet that we call our own`,
  },
  {
    id: 1007,
    title: 'Astral Blossom',
    artist: 'Nebula Garden',
    album: 'Cosmic Flora',
    durationMs: 221000,
    mediaUri: 'synth://astral-blossom',
    artworkUri: 'linear-gradient:45:#221626:#5A2B6D',
    isFavorite: false,
    playCount: 11,
    popularityScore: 77,
    dateAdded: Date.now() - 86400000 * 1,
    folderName: 'Nocturnal Synthwave',
    folderPath: '/storage/emulated/0/Music/Nocturnal Synthwave',
    synthProfile: {
      rootFreq: 246.94, // B3
      chordRatios: [1, 1.2, 1.5, 1.78],
      tempoBpm: 88,
      waveform: 'sine',
    },
    lyrics: `[ti:Astral Blossom]
[ar:Nebula Garden]
[al:Cosmic Flora]
[00:00.00] ⋯ Celestial Harp & Pad Intro ⋯
[00:05.50] Petals unfolding in zero gravity light
[00:12.50] Blooming quietly across the cosmic night
[00:20.00] Stardust pollen drifting on a solar wind
[00:28.00] Where the constellation gardens all begin`,
  },
  {
    id: 1008,
    title: 'Urban Raindrops',
    artist: 'Lo-Fi Beats Collective',
    album: 'Windowpanes',
    durationMs: 175000,
    mediaUri: 'synth://urban-raindrops',
    artworkUri: 'linear-gradient:45:#16191D:#323C47',
    isFavorite: false,
    playCount: 8,
    popularityScore: 73,
    dateAdded: Date.now(),
    folderName: 'Lo-Fi Study Tapes',
    folderPath: '/storage/emulated/0/Music/Lo-Fi Study Tapes',
    synthProfile: {
      rootFreq: 207.65, // G#3
      chordRatios: [1, 1.2, 1.5, 1.8],
      tempoBpm: 76,
      waveform: 'triangle',
    },
    lyrics: `[ti:Urban Raindrops]
[ar:Lo-Fi Beats Collective]
[al:Windowpanes]
[00:00.00] ⋯ Rain on Glass & Dusty Boom-Bap Intro ⋯
[00:04.00] Silver droplets racing down the windowpane
[00:10.50] Muted trumpets floating through the evening rain
[00:17.20] Notebook open by the desk lamp glow
[00:24.00] Letting all the noisy city worries go`,
  },
];

export const PRESEEDED_FOLDERS: AddedFolder[] = [
  {
    id: 1,
    name: 'Featured Music',
    path: '/storage/emulated/0/Music/Featured Music',
    songCount: 3,
    dateAdded: Date.now() - 86400000 * 7,
    artworkUri: 'linear-gradient:135:#1A1A24:#4A306D',
    isArtworkConfirmed: true,
    candidateUrls: [
      'linear-gradient:135:#1A1A24:#4A306D',
      'linear-gradient:135:#182026:#2A4B5E',
      'linear-gradient:135:#21141E:#5E2442',
    ],
    candidateIndex: 0,
  },
  {
    id: 2,
    name: 'Lo-Fi Study Tapes',
    path: '/storage/emulated/0/Music/Lo-Fi Study Tapes',
    songCount: 3,
    dateAdded: Date.now() - 86400000 * 4,
    artworkUri: 'linear-gradient:135:#0F1D1A:#1E4B3E',
    isArtworkConfirmed: false, // Demonstrates the Keep / Try cover artwork confirmation UI!
    candidateUrls: [
      'linear-gradient:135:#0F1D1A:#1E4B3E',
      'linear-gradient:135:#261E14:#6B4E26',
      'linear-gradient:135:#16191D:#323C47',
    ],
    candidateIndex: 0,
  },
  {
    id: 3,
    name: 'Nocturnal Synthwave',
    path: '/storage/emulated/0/Music/Nocturnal Synthwave',
    songCount: 2,
    dateAdded: Date.now() - 86400000 * 2,
    artworkUri: 'linear-gradient:135:#111B24:#1C5870',
    isArtworkConfirmed: true,
    candidateUrls: [
      'linear-gradient:135:#111B24:#1C5870',
      'linear-gradient:135:#221626:#5A2B6D',
    ],
    candidateIndex: 0,
  },
];

export const PRESEEDED_PLAYLISTS: Playlist[] = [
  {
    id: 201,
    name: 'Late Night Focus',
    createdAt: Date.now() - 86400000 * 3,
    songIds: [1001, 1003, 1005, 1008],
  },
  {
    id: 202,
    name: 'Horizon Drive',
    createdAt: Date.now() - 86400000 * 1,
    songIds: [1002, 1004, 1006, 1007],
  },
];

/**
 * Extra un-imported tracks living in the simulated Device File Explorer
 * so users can browse directories and click "Add All" or "Add to Library"
 */
export const EXPLORER_EXTRA_TRACKS: Song[] = [
  {
    id: 1009,
    title: 'Subzero Horizon',
    artist: 'Glacier Analogue',
    album: 'Polar Drift',
    durationMs: 204000,
    mediaUri: 'synth://subzero-horizon',
    artworkUri: 'linear-gradient:45:#0F172A:#334155',
    isFavorite: false,
    playCount: 4,
    popularityScore: 79,
    dateAdded: Date.now(),
    folderName: 'Ambient Vault',
    folderPath: '/storage/emulated/0/Downloads/Ambient Vault',
    synthProfile: {
      rootFreq: 146.83, // D3
      chordRatios: [1, 1.2, 1.5, 1.8],
      tempoBpm: 70,
      waveform: 'sine',
    },
    lyrics: `[ti:Subzero Horizon]
[ar:Glacier Analogue]
[00:00.00] ⋯ Glacial Pad Intro ⋯
[00:05.00] Crystalline silence across the frozen bay
[00:13.00] Northern lights dancing in silver and gray`,
  },
  {
    id: 1010,
    title: 'Analogue Espresso',
    artist: 'Kissa Trio',
    album: 'Tokyo Morning',
    durationMs: 162000,
    mediaUri: 'synth://analogue-espresso',
    artworkUri: 'linear-gradient:45:#271C19:#55423D',
    isFavorite: false,
    playCount: 6,
    popularityScore: 82,
    dateAdded: Date.now(),
    folderName: 'Vinyl Rips',
    folderPath: '/storage/emulated/0/Downloads/Vinyl Rips',
    synthProfile: {
      rootFreq: 246.94,
      chordRatios: [1, 1.25, 1.5, 1.875],
      tempoBpm: 90,
      waveform: 'triangle',
    },
    lyrics: `[ti:Analogue Espresso]
[ar:Kissa Trio]
[00:00.00] ⋯ Warm Jazz Vinyl Intro ⋯
[00:04.50] Needle in the groove as the morning begins
[00:11.00] Warm espresso steam andupright bass spins`,
  },
  {
    id: 1011,
    title: 'Monochrome Rain',
    artist: 'Kissa Trio',
    album: 'Tokyo Morning',
    durationMs: 190000,
    mediaUri: 'synth://monochrome-rain',
    artworkUri: 'linear-gradient:45:#18181B:#3F3F46',
    isFavorite: false,
    playCount: 2,
    popularityScore: 75,
    dateAdded: Date.now(),
    folderName: 'Vinyl Rips',
    folderPath: '/storage/emulated/0/Downloads/Vinyl Rips',
    synthProfile: {
      rootFreq: 220.0,
      chordRatios: [1, 1.2, 1.5, 1.75],
      tempoBpm: 82,
      waveform: 'sine',
    },
    lyrics: `[ti:Monochrome Rain]
[ar:Kissa Trio]
[00:00.00] ⋯ Soft Brushes & Piano Intro ⋯
[00:06.00] Umbrellas drifting past the station door
[00:14.00] Reflections pooling on the concrete floor`,
  },
];

export const COMMON_STORAGE_ROOTS = [
  { name: 'Music', path: '/storage/emulated/0/Music' },
  { name: 'Downloads', path: '/storage/emulated/0/Downloads' },
  { name: 'Storage Root', path: '/storage/emulated/0' },
];
