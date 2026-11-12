import { Song } from '../types/music';

type TickCallback = (positionMs: number) => void;
type EndedCallback = () => void;

/**
 * Hybrid Audio Engine:
 * - Plays native HTML5 <audio> for blob: or local uploaded audio files
 * - Synthesizes warm ambient/synth/lo-fi Web Audio soundscapes for preseeded synth:// tracks
 *   so playback works instantaneously with zero network stalls or CORS errors in headless/sandboxed browsers.
 */
export class HybridAudioEngine {
  private audioEl: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSong: Song | null = null;
  private isPlaying = false;
  private positionMs = 0;
  private tickInterval: number | null = null;
  private synthNoteTimer: number | null = null;
  private lastTickTime = 0;
  private stepCounter = 0;

  private onTick: TickCallback;
  private onEnded: EndedCallback;

  constructor(onTick: TickCallback, onEnded: EndedCallback) {
    this.onTick = onTick;
    this.onEnded = onEnded;
  }

  public loadAndPlay(song: Song, startPositionMs = 0): void {
    this.stopInternal();
    this.currentSong = song;
    this.positionMs = startPositionMs;
    this.isPlaying = true;
    this.stepCounter = Math.floor(startPositionMs / 600);

    if (song.mediaUri.startsWith('blob:') || song.mediaUri.startsWith('data:audio')) {
      this.audioEl = new Audio(song.mediaUri);
      this.audioEl.currentTime = startPositionMs / 1000;
      this.audioEl.addEventListener('timeupdate', () => {
        if (this.audioEl && this.isPlaying) {
          this.positionMs = Math.floor(this.audioEl.currentTime * 1000);
          this.onTick(this.positionMs);
        }
      });
      this.audioEl.addEventListener('ended', () => {
        this.isPlaying = false;
        this.onEnded();
      });
      this.audioEl.play().catch(() => {
        // Fallback to timer tick if autoplay blocked before gesture
        this.startTimerLoop();
      });
    } else {
      this.startSynthLoop();
      this.startTimerLoop();
    }
  }

  public play(): void {
    if (!this.currentSong) return;
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (this.audioEl) {
      this.audioEl.play().catch(() => {
        this.startTimerLoop();
      });
    } else {
      this.startSynthLoop();
      this.startTimerLoop();
    }
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
    this.stopTimerLoop();
    this.stopSynthLoop();
  }

  public seekTo(targetMs: number): void {
    if (!this.currentSong) return;
    const clamped = Math.max(0, Math.min(this.currentSong.durationMs, targetMs));
    this.positionMs = clamped;
    if (this.audioEl) {
      this.audioEl.currentTime = clamped / 1000;
    }
    this.onTick(this.positionMs);
  }

  public destroy(): void {
    this.stopInternal();
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }

  private stopInternal(): void {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.src = '';
      this.audioEl = null;
    }
    this.stopTimerLoop();
    this.stopSynthLoop();
  }

  private startTimerLoop(): void {
    this.stopTimerLoop();
    this.lastTickTime = performance.now();
    this.tickInterval = window.setInterval(() => {
      if (!this.isPlaying || !this.currentSong) return;
      const now = performance.now();
      const delta = now - this.lastTickTime;
      this.lastTickTime = now;
      this.positionMs += delta;

      if (this.positionMs >= this.currentSong.durationMs) {
        this.positionMs = this.currentSong.durationMs;
        this.onTick(this.positionMs);
        this.pause();
        this.onEnded();
      } else {
        this.onTick(Math.floor(this.positionMs));
      }
    }, 100);
  }

  private stopTimerLoop(): void {
    if (this.tickInterval !== null) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  private ensureAudioContext(): AudioContext | null {
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtx();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 0.12;
        this.masterGain.connect(this.audioCtx.destination);
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  private startSynthLoop(): void {
    this.stopSynthLoop();
    const profile = this.currentSong?.synthProfile ?? {
      rootFreq: 220,
      chordRatios: [1, 1.2, 1.5, 1.8],
      tempoBpm: 84,
      waveform: 'sine' as OscillatorType,
    };

    const stepDurationMs = Math.round((60 / profile.tempoBpm) * 1000);
    const triggerNote = () => {
      if (!this.isPlaying) return;
      const ctx = this.ensureAudioContext();
      if (!ctx || !this.masterGain) return;

      try {
        const now = ctx.currentTime;
        const ratio = profile.chordRatios[this.stepCounter % profile.chordRatios.length];
        const octaveMult = this.stepCounter % 8 === 0 ? 0.5 : this.stepCounter % 4 === 2 ? 2 : 1;
        const freq = profile.rootFreq * ratio * octaveMult;

        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = profile.waveform;
        osc.frequency.setValueAtTime(freq, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + (stepDurationMs / 1000) * 1.4);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + (stepDurationMs / 1000) * 1.45);
        this.stepCounter++;
      } catch {
        // Ignore audio context state errors in headless mode
      }
    };

    triggerNote();
    this.synthNoteTimer = window.setInterval(triggerNote, stepDurationMs);
  }

  private stopSynthLoop(): void {
    if (this.synthNoteTimer !== null) {
      clearInterval(this.synthNoteTimer);
      this.synthNoteTimer = null;
    }
  }
}
