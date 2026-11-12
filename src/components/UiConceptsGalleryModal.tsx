import React, { useState } from 'react';
import { X, Maximize2, Check, Sparkles, Eye } from 'lucide-react';
import { ThemeMode } from '../types/music';

import swissMonochromeImg from '../assets/images/ui_concept_swiss_monochrome_1794499353509.jpg';
import obsidianGlassImg from '../assets/images/ui_concept_obsidian_glass_1794499354383.jpg';
import nothingDotMatrixImg from '../assets/images/ui_concept_nothing_dotmatrix_1794499357186.jpg';
import alabasterStudioImg from '../assets/images/ui_concept_alabaster_studio_1794499358376.jpg';
import zenSplitStageImg from '../assets/images/ui_concept_zen_split_stage_1794499361303.jpg';

export interface UiConceptItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  image: string;
  recommendedTheme: ThemeMode;
  highlights: string[];
  palette: string[];
}

export const UI_CONCEPTS: UiConceptItem[] = [
  {
    id: 'swiss',
    number: '01',
    title: 'Swiss Editorial Monochrome',
    subtitle: 'Dieter Rams / Braun & Teenage Engineering Inspired',
    image: swissMonochromeImg,
    recommendedTheme: 'DARK',
    highlights: [
      'Exposed 1px architectural hairline grid (#26262A)',
      'Oversized tabular monospace track indices (01, 02, 03)',
      'Docked right-hand vinyl turntable with tonearm & peak waveform',
    ],
    palette: ['#0D0D0F', '#18181C', '#26262A', '#F7F7F8'],
  },
  {
    id: 'obsidian',
    number: '02',
    title: 'Obsidian Frosted Glass & Ambient Halo',
    subtitle: 'Linear & Raycast Inspired 3-Pane Studio',
    image: obsidianGlassImg,
    recommendedTheme: 'DARK',
    highlights: [
      'Translucent dark glass panels with ultra-fine 1px borders',
      'Persistent right-side Now Playing + Synced Lyrics column',
      'Soft monochrome ambient glow behind active album artwork',
    ],
    palette: ['#09090B', '#141418', '#27272A', '#FFFFFF'],
  },
  {
    id: 'nothing',
    number: '03',
    title: 'Industrial Dot-Matrix & Pure OLED Black',
    subtitle: 'Nothing OS Inspired High-Contrast Wireframe',
    image: nothingDotMatrixImg,
    recommendedTheme: 'AMOLED',
    highlights: [
      'True #000000 AMOLED canvas with sharp wireframe containers',
      'Circular radial audio spectrum ring around the spinning vinyl',
      'Dot-matrix headers & single crimson recording-dot active indicator',
    ],
    palette: ['#000000', '#0C0C0C', '#262626', '#EF4444'],
  },
  {
    id: 'alabaster',
    number: '04',
    title: 'Warm Alabaster Daylight Studio',
    subtitle: 'Hi-Fi Audiophile Minimal Light Mode',
    image: alabasterStudioImg,
    recommendedTheme: 'LIGHT',
    highlights: [
      'Warm stone-and-alabaster daylight canvas (#F5F5F7)',
      'Elevated white folder cards with subtle soft shadows',
      'Bottom audiophile transport bar with vinyl sleeve & waveform scrubber',
    ],
    palette: ['#F5F5F7', '#FFFFFF', '#E5E5EA', '#111827'],
  },
  {
    id: 'zen',
    number: '05',
    title: 'Zen Split-Stage Turntable & Lyric Theater',
    subtitle: '50/50 Vinyl Stage & Tabbed Workspace',
    image: zenSplitStageImg,
    recommendedTheme: 'DARK',
    highlights: [
      'Left 50% dedicated to an oversized rotating vinyl turntable + tonearm',
      'Right 50% tabbed drawer for Synced LRC Lyrics, Folders, and Search',
      'Waveform scrub bar directly underneath the turntable stage',
    ],
    palette: ['#111114', '#1A1A1F', '#2E2E36', '#F4F4F6'],
  },
];

interface UiConceptsGalleryModalProps {
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  onDismiss: () => void;
}

export const UiConceptsGalleryModal: React.FC<UiConceptsGalleryModalProps> = ({
  onSelectTheme,
  onDismiss,
}) => {
  const [selectedConcept, setSelectedConcept] = useState<UiConceptItem>(UI_CONCEPTS[0]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const handleApplyTheme = (concept: UiConceptItem) => {
    onSelectTheme(concept.recommendedTheme);
    setAppliedId(concept.id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="5 UI Design Concepts"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-6 overflow-y-auto"
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl rounded-3xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-4 sm:p-6 space-y-5 shadow-2xl max-h-[94vh] overflow-y-auto"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Visual Design Showcase · 5 Generated Mockups</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mt-1">
              5 Modern, Sleek, Minimal UI Designs
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Click any concept below to inspect the full-resolution UI design, or tell me which number (1–5) you want me to build as your main layout.
            </p>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close UI Design Gallery"
            className="w-9 h-9 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Featured Large Preview of Selected Concept */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Large Image Stage (8 cols) */}
          <div className="lg:col-span-8 relative group rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-black">
            <img
              src={selectedConcept.image}
              alt={selectedConcept.title}
              className="w-full aspect-video object-cover cursor-zoom-in"
              onClick={() => setIsLightboxOpen(true)}
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-sm border border-white/15 text-xs font-mono font-bold text-white">
              Design #{selectedConcept.number} · {selectedConcept.title}
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black text-white text-xs font-semibold inline-flex items-center gap-1.5 border border-white/15 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Screen Image</span>
            </button>
          </div>

          {/* Concept Details & Palette (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                CONCEPT {selectedConcept.number} / 05
              </span>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                {selectedConcept.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {selectedConcept.subtitle}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-[var(--text-primary)]">
                Key UI Features
              </div>
              <ul className="space-y-1.5">
                {selectedConcept.highlights.map((item) => (
                  <li
                    key={item}
                    className="text-xs text-[var(--text-secondary)] flex items-start gap-2 leading-relaxed"
                  >
                    <span className="text-[var(--text-primary)] font-mono mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-[var(--text-primary)]">
                Color Tokens
              </div>
              <div className="flex items-center gap-2">
                {selectedConcept.palette.map((hex) => (
                  <div
                    key={hex}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                      {hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleApplyTheme(selectedConcept)}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent-primary)] text-[var(--accent-contrast)] text-xs font-bold inline-flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                {appliedId === selectedConcept.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Applied Theme Palette ({selectedConcept.recommendedTheme})</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Preview Palette ({selectedConcept.recommendedTheme})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 5 Thumbnail Strip Grid (All 5 visible side-by-side) */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[var(--text-secondary)]">
            All 5 UI Design Concepts (Click to inspect)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {UI_CONCEPTS.map((concept) => {
              const isSelected = concept.id === selectedConcept.id;
              return (
                <button
                  key={concept.id}
                  type="button"
                  onClick={() => setSelectedConcept(concept)}
                  className={`group text-left rounded-2xl overflow-hidden border transition-all p-2 space-y-2 ${
                    isSelected
                      ? 'bg-[var(--bg-elevated)] border-[var(--text-primary)] ring-1 ring-[var(--text-primary)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--text-secondary)]'
                  }`}
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                    <img
                      src={concept.image}
                      alt={concept.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono font-bold text-white">
                      #{concept.number}
                    </span>
                  </div>
                  <div className="px-1">
                    <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {concept.title}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate">
                      {concept.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full-Screen Zoom Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <img
            src={selectedConcept.image}
            alt={selectedConcept.title}
            className="max-w-full max-h-[90vh] rounded-2xl border border-white/20 shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close Full Screen Image"
            className="fixed top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
