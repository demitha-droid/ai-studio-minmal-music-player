import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MoreVertical,
  Folder,
  Search,
  X,
  Moon,
  Sun,
  Contrast,
  Image as ImageIcon,
  ListPlus,
  Trash2,
} from 'lucide-react';
import { Song, ThemeMode, THEME_LABELS } from '../types/music';
import {
  formatDuration,
  getArtworkInitials,
  resolveArtworkGradient,
} from '../utils/musicLogic';

interface MinimalArtworkProps {
  title: string;
  artworkUri?: string | null;
  size?: number;
  radius?: number;
  className?: string;
  isVinylCenter?: boolean;
}

export const MinimalArtwork: React.FC<MinimalArtworkProps> = React.memo(({
  title,
  artworkUri,
  size = 48,
  radius = 12,
  className = '',
  isVinylCenter = false,
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [artworkUri]);

  const gradient = resolveArtworkGradient(artworkUri);
  const isImageUrl =
    artworkUri &&
    !gradient &&
    (artworkUri.startsWith('http://') ||
      artworkUri.startsWith('https://') ||
      artworkUri.startsWith('data:') ||
      artworkUri.startsWith('blob:'));

  const dimensionStyle: React.CSSProperties =
    size > 0
      ? { width: `${size}px`, height: `${size}px`, borderRadius: `${radius}px` }
      : { borderRadius: `${radius}px` };

  if (isImageUrl && !imgError) {
    return (
      <div
        style={dimensionStyle}
        className={`relative overflow-hidden shrink-0 border border-[var(--border-subtle)] bg-[var(--bg-elevated)] ${className}`}
      >
        <img
          src={artworkUri}
          alt={`Cover for ${title}`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (isVinylCenter) {
    return (
      <div
        style={{
          ...dimensionStyle,
          backgroundImage: gradient || undefined,
        }}
        className={`flex flex-col items-center justify-between py-3.5 shrink-0 border border-[var(--border-subtle)] select-none ${
          gradient ? 'text-white/90' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
        } ${className}`}
      >
        <span className="text-xs font-bold tracking-widest uppercase">
          {getArtworkInitials(title)}
        </span>
        <span className="text-[9px] font-mono tracking-widest opacity-60">33 RPM</span>
      </div>
    );
  }

  return (
    <div
      style={{
        ...dimensionStyle,
        backgroundImage: gradient || undefined,
      }}
      className={`flex items-center justify-center shrink-0 border border-[var(--border-subtle)] select-none ${
        gradient ? 'text-white/90' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
      } ${className}`}
    >
      <span
        style={{ fontSize: size > 0 ? `${Math.max(11, Math.round(size * 0.32))}px` : '18px' }}
        className="font-bold tracking-tight"
      >
        {getArtworkInitials(title)}
      </span>
    </div>
  );
});

interface FolderCoverImageProps {
  artworkUri?: string | null;
  folderName: string;
  size?: number;
  radius?: number;
  className?: string;
}

export const FolderCoverImage: React.FC<FolderCoverImageProps> = React.memo(({
  artworkUri,
  folderName,
  size = 0,
  radius = 12,
  className = '',
}) => {
  return (
    <MinimalArtwork
      title={folderName}
      artworkUri={artworkUri}
      size={size}
      radius={radius}
      className={className}
    />
  );
});

export const EqualizerIndicator: React.FC<{ className?: string }> = React.memo(({ className = '' }) => {
  return (
    <div
      aria-label="Playing indicator"
      className={`inline-flex items-end gap-[2px] w-4 h-5 pb-0.5 ${className}`}
    >
      <span className="w-[3px] h-4 origin-bottom rounded-full bg-[var(--equalizer-bar)] animate-eq-1" />
      <span className="w-[3px] h-4 origin-bottom rounded-full bg-[var(--equalizer-bar)] animate-eq-2" />
      <span className="w-[3px] h-4 origin-bottom rounded-full bg-[var(--equalizer-bar)] animate-eq-3" />
    </div>
  );
});

interface MinimalSearchBarProps {
  query: string;
  onQueryChange: (val: string) => void;
  placeholderText?: string;
  ariaLabel?: string;
}

export const MinimalSearchBar: React.FC<MinimalSearchBarProps> = ({
  query,
  onQueryChange,
  placeholderText = 'Search folders or songs...',
  ariaLabel = 'Search',
}) => {
  return (
    <div className="relative flex items-center w-full h-[46px] px-4 rounded-[23px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus-within:border-[var(--text-primary)] transition-colors">
      <Search className="w-5 h-5 text-[var(--text-secondary)] shrink-0 mr-2.5" />
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholderText}
        aria-label={ariaLabel}
        className="w-full bg-transparent text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
      />
      {query.length > 0 && (
        <button
          type="button"
          onClick={() => onQueryChange('')}
          aria-label="Clear search"
          className="p-1.5 rounded-full hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

interface ThemeSwitcherButtonProps {
  currentTheme: ThemeMode;
  onThemeSelect: (mode: ThemeMode) => void;
}

export const ThemeSwitcherButton: React.FC<ThemeSwitcherButtonProps> = ({
  currentTheme,
  onThemeSelect,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const CurrentIcon =
    currentTheme === 'DARK' ? Moon : currentTheme === 'AMOLED' ? Contrast : Sun;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Theme: ${THEME_LABELS[currentTheme]}`}
        title={`Theme: ${THEME_LABELS[currentTheme]}`}
        className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
      >
        <CurrentIcon className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-xl py-1.5 z-50">
          {(['DARK', 'AMOLED', 'LIGHT'] as ThemeMode[]).map((mode) => {
            const Icon = mode === 'DARK' ? Moon : mode === 'AMOLED' ? Contrast : Sun;
            const active = mode === currentTheme;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  onThemeSelect(mode);
                  setOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center gap-2.5 hover:bg-[var(--bg-surface)] transition-colors whitespace-nowrap ${
                  active
                    ? 'font-bold text-[var(--text-primary)]'
                    : 'font-normal text-[var(--text-secondary)]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{THEME_LABELS[mode]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface SongListItemProps {
  song: Song;
  isPlaying: boolean;
  isCurrentSong: boolean;
  onSongClick: () => void;
  onFavoriteToggle: () => void;
  onAddToPlaylistClick?: () => void;
  onRemoveFromPlaylistClick?: () => void;
  onFetchArtwork?: () => void;
  showPlayCount?: boolean;
}

export const SongListItem: React.FC<SongListItemProps> = React.memo(({
  song,
  isPlaying,
  isCurrentSong,
  onSongClick,
  onFavoriteToggle,
  onAddToPlaylistClick,
  onRemoveFromPlaylistClick,
  onFetchArtwork,
  showPlayCount = false,
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

  const hasActions = Boolean(
    onAddToPlaylistClick || onRemoveFromPlaylistClick || onFetchArtwork
  );

  return (
    <div
      className={`group flex items-center gap-3 w-full px-2.5 py-2 rounded-xl transition-colors ${
        isCurrentSong
          ? 'bg-[var(--bg-elevated)]/80'
          : 'hover:bg-[var(--bg-elevated)]/50'
      }`}
    >
      <button
        type="button"
        onClick={onSongClick}
        aria-label={`Play ${song.title} by ${song.artist}`}
        className="flex items-center gap-3 flex-1 min-w-0 text-left focus:outline-none"
      >
        <MinimalArtwork
          title={song.title}
          size={46}
          radius={10}
          artworkUri={song.artworkUri}
        />

        <div className="flex-1 min-w-0">
          <div
            className={`text-[15px] leading-5 truncate ${
              isCurrentSong
                ? 'font-bold text-[var(--text-primary)]'
                : 'font-normal text-[var(--text-primary)]'
            }`}
          >
            {song.title}
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[var(--text-secondary)] min-w-0">
            {song.folderName && (
              <>
                <span className="hidden sm:inline-flex items-center gap-1 truncate max-w-[120px] text-[11px] font-medium text-[var(--text-secondary)]">
                  <Folder className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{song.folderName}</span>
                </span>
                <span aria-hidden="true" className="hidden sm:inline">
                  ·
                </span>
              </>
            )}
            <span className="truncate">{song.artist}</span>
            {showPlayCount && song.playCount > 0 && (
              <>
                <span aria-hidden="true" className="text-[var(--text-muted)]">
                  ·
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-mono tabular-nums shrink-0">
                  {song.playCount} plays
                </span>
              </>
            )}
          </div>
        </div>
      </button>

      <div className="flex items-center gap-1 shrink-0">
        {isCurrentSong && isPlaying ? (
          <div className="px-2 flex items-center">
            <EqualizerIndicator />
          </div>
        ) : (
          <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)] px-1.5">
            {formatDuration(song.durationMs)}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          aria-label={
            song.isFavorite
              ? `Remove ${song.title} from favorites`
              : `Add ${song.title} to favorites`
          }
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--bg-surface)] transition-transform active:scale-90"
        >
          <Heart
            className={`w-[18px] h-[18px] transition-colors ${
              song.isFavorite
                ? 'fill-[var(--text-primary)] text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          />
        </button>

        {hasActions && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((v) => !v);
              }}
              aria-label={`More options for ${song.title}`}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
            >
              <MoreVertical className="w-[18px] h-[18px]" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-xl py-1 z-40">
                {onFetchArtwork && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onFetchArtwork();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface)] flex items-center gap-2.5 whitespace-nowrap"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    <span>Get YouTube Picture</span>
                  </button>
                )}
                {onAddToPlaylistClick && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onAddToPlaylistClick();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface)] flex items-center gap-2.5 whitespace-nowrap"
                  >
                    <ListPlus className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                    <span>Add to playlist</span>
                  </button>
                )}
                {onRemoveFromPlaylistClick && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onRemoveFromPlaylistClick();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-red-400 hover:bg-[var(--bg-surface)] flex items-center gap-2.5 whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove from playlist</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
