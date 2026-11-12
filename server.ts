import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function cleanSongTitle(raw: string): string {
  return raw
    .replace(/\.(mp3|m4a|wav|flac|ogg|aac|opus|wma)$/i, '')
    .replace(/^\d+[\s.-]+/, '')
    .replace(/\[.*?\]/g, ' ')
    .replace(/\(.*?official.*?\)/gi, ' ')
    .replace(/\(.*?video.*?\)/gi, ' ')
    .replace(/\(.*?lyrics.*?\)/gi, ' ')
    .replace(/\(.*?audio.*?\)/gi, ' ')
    .replace(/\(.*?remaster.*?\)/gi, ' ')
    .replace(/[_\-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function cleanArtistName(raw: string): string {
  if (/^(unknown artist|<unknown>)$/i.test(raw.trim())) {
    return '';
  }
  return raw.replace(/[_\-]+/g, ' ').trim().replace(/\s+/g, ' ');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // 1. Multi-source Lyrics Resolver (LRCLIB + Lyrics.ovh)
  app.get('/api/lyrics', async (req, res) => {
    const rawTitle = String(req.query.title || '');
    const rawArtist = String(req.query.artist || '');
    const durationSec = Number(req.query.durationSec || 0);

    const title = cleanSongTitle(rawTitle);
    const artist = cleanArtistName(rawArtist);

    if (!title) {
      return res.status(400).json({ error: 'Missing track title' });
    }

    try {
      // Attempt 1: LRCLIB Exact Lookup
      const getParams = new URLSearchParams({ track_name: title });
      if (artist) getParams.set('artist_name', artist);
      if (durationSec > 10) getParams.set('duration', String(Math.round(durationSec)));

      const exactResp = await fetch(`https://lrclib.net/api/get?${getParams.toString()}`, {
        headers: {
          'User-Agent': 'MinimalMusicPlayer/1.0',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);

      if (exactResp && exactResp.ok) {
        const data = (await exactResp.json()) as { syncedLyrics?: string; plainLyrics?: string };
        if (data.syncedLyrics?.trim()) {
          return res.json({ lyrics: data.syncedLyrics.trim(), source: 'LRCLIB Synced' });
        }
        if (data.plainLyrics?.trim()) {
          return res.json({ lyrics: data.plainLyrics.trim(), source: 'LRCLIB Plain' });
        }
      }

      // Attempt 2: LRCLIB Search Query
      const searchQ = artist ? `${title} ${artist}` : title;
      const searchResp = await fetch(
        `https://lrclib.net/api/search?q=${encodeURIComponent(searchQ)}`,
        {
          headers: {
            'User-Agent': 'MinimalMusicPlayer/1.0',
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        }
      ).catch(() => null);

      if (searchResp && searchResp.ok) {
        const items = (await searchResp.json()) as Array<{
          syncedLyrics?: string;
          plainLyrics?: string;
        }>;
        if (Array.isArray(items)) {
          for (const item of items.slice(0, 5)) {
            if (item.syncedLyrics?.trim()) {
              return res.json({ lyrics: item.syncedLyrics.trim(), source: 'LRCLIB Search' });
            }
          }
          for (const item of items.slice(0, 5)) {
            if (item.plainLyrics?.trim()) {
              return res.json({ lyrics: item.plainLyrics.trim(), source: 'LRCLIB Plain' });
            }
          }
        }
      }

      // Attempt 3: Lyrics.ovh fallback
      if (artist) {
        const ovhResp = await fetch(
          `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
          {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(5000),
          }
        ).catch(() => null);

        if (ovhResp && ovhResp.ok) {
          const ovhData = (await ovhResp.json()) as { lyrics?: string };
          if (ovhData.lyrics?.trim()) {
            return res.json({ lyrics: ovhData.lyrics.trim(), source: 'Lyrics.ovh' });
          }
        }
      }

      return res.json({ lyrics: null, source: 'none' });
    } catch (error) {
      return res.json({ lyrics: null, source: 'error', message: String(error) });
    }
  });

  // 2. High-Resolution Artwork / Thumbnail Resolver
  app.get('/api/artwork', async (req, res) => {
    const rawTitle = String(req.query.title || '');
    const rawArtist = String(req.query.artist || '');
    const title = cleanSongTitle(rawTitle);
    const artist = cleanArtistName(rawArtist);
    const query = [title, artist].filter(Boolean).join(' ');

    if (!query) {
      return res.status(400).json({ error: 'Missing query' });
    }

    try {
      const itunesResp = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=5`,
        { signal: AbortSignal.timeout(5000) }
      ).catch(() => null);

      if (itunesResp && itunesResp.ok) {
        const data = (await itunesResp.json()) as {
          results?: Array<{ artworkUrl100?: string }>;
        };
        const candidates = (data.results || [])
          .map((r) => r.artworkUrl100?.replace('100x100bb', '600x600bb'))
          .filter((u): u is string => Boolean(u));

        if (candidates.length > 0) {
          return res.json({ artworkUri: candidates[0], candidates });
        }
      }

      return res.json({ artworkUri: null, candidates: [] });
    } catch {
      return res.json({ artworkUri: null, candidates: [] });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Minimal Music Player server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
