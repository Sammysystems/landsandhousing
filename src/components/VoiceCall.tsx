import React, { useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Speaker,
  LayoutGrid,
  PhoneOff,
  Delete,
  FileText,
  X,
} from 'lucide-react';
import type { VoiceStatus } from './VoiceAgent';

/**
 * VoiceCall — a phone-style call screen for talking with the advisor.
 *
 * Calling → ring pulse + soft tone → connected (live timer, auto-listening).
 * The visitor answers by voice; Aisha's spoken replies show as a live caption
 * strip, and property cards / the booking form arrive in a bottom sheet while
 * the call keeps running behind it.
 *
 * Pure presentation: all state lives in ConciergeChat; everything here is a
 * controlled prop + handler.
 */

export type LastPair = { q: string; a: string };

type Props = {
  calling: boolean;
  connected: boolean;
  elapsed: number;
  status: VoiceStatus;
  muted: boolean;
  speakerOn: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onEnd: () => void;
  onTranscript: () => void;
  keypadOpen: boolean;
  onKeypadToggle: () => void;
  draft: string;
  onDraftDigit: (d: string) => void;
  onDraftBackspace: () => void;
  onDraftClear: () => void;
  onDraftSend: () => void;
  sheetOpen: boolean;
  sheetTitle: string;
  onCloseSheet: () => void;
  sheet: React.ReactNode;
  lastPair: LastPair;
  name: string;
  title: string;
};

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'] as const;

const fmt = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

/** Lazy shared AudioContext for ring + keypad tones. Stable identity across renders. */
function useCallAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const ensureRef = useRef<(() => AudioContext | null) | null>(null);
  if (!ensureRef.current) {
    ensureRef.current = () => {
      let ctx = ctxRef.current;
      if (!ctx) {
        try {
          ctx = new AudioContext();
          ctxRef.current = ctx;
        } catch {
          return null;
        }
      }
      if (ctx.state === 'suspended') void ctx.resume();
      return ctx;
    };
  }
  useEffect(
    () => () => {
      void ctxRef.current?.close();
      ctxRef.current = null;
    },
    [],
  );
  return ensureRef.current!;
}

function beep(ctx: AudioContext, freq: number, dur = 0.4, delay = 0, vol = 0.09) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
  g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + delay + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(ctx.currentTime + delay);
  o.stop(ctx.currentTime + delay + dur + 0.06);
}

function Key({ label, onClick }: { key?: React.Key; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 w-full rounded-lg bg-[#2A2926] text-white text-lg font-medium hover:bg-[#3A3935] active:bg-[#A98946] transition-colors cursor-pointer select-none"
      aria-label={`Key ${label}`}
    >
      {label}
    </button>
  );
}

function CallButton({
  active,
  label,
  icon,
  onClick,
}: {
  active?: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5 text-white transition-colors cursor-pointer ${
        active ? 'bg-[#A98946]' : 'bg-[#2A2926] hover:bg-[#3A3935]'
      }`}
    >
      {icon}
      <span className="text-[8.5px] uppercase letter-luxury font-sans-ui leading-none">{label}</span>
    </button>
  );
}

export default function VoiceCall({
  calling,
  connected,
  elapsed,
  status,
  muted,
  speakerOn,
  onToggleMute,
  onToggleSpeaker,
  onEnd,
  onTranscript,
  keypadOpen,
  onKeypadToggle,
  draft,
  onDraftDigit,
  onDraftBackspace,
  onDraftClear,
  onDraftSend,
  sheetOpen,
  sheetTitle,
  onCloseSheet,
  sheet,
  lastPair,
  name,
  title,
}: Props) {
  const ensureAudio = useCallAudio();

  useEffect(() => {
    if (!calling || muted) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    beep(ctx, 440, 0.45, 0, 0.1);
    beep(ctx, 440, 0.45, 0.7, 0.1);
  }, [calling, muted, ensureAudio]);

  const tone = () => {
    const ctx = ensureAudio();
    if (ctx) beep(ctx, 1050, 0.07, 0, 0.035);
  };

  const keytap = (k: string) => {
    tone();
    onDraftDigit(k);
  };

  const statusText = useMemo(() => {
    if (calling) return 'Calling Aisha…';
    if (!connected) return 'Connecting…';
    if (status.speaking || status.suspended) return 'Aisha is speaking…';
    if (status.listening) return 'Listening… speak anytime';
    return 'On the line';
  }, [calling, connected, status.speaking, status.suspended, status.listening]);

  const caption = status.interim || lastPair.a || lastPair.q;
  const listening = status.listening;
  const avatarPulse = calling;

  return (
    <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden bg-gradient-to-b from-[#222220] via-[#171716] to-[#0F0F0E] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-serif text-[15px] font-semibold leading-tight truncate">
              {name} · {title}
            </p>
            <p className="text-[10px] font-sans-ui text-white/55 leading-tight">
              Uyo · LandsandHousing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onTranscript}
            aria-label="Open transcript"
            className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onEnd}
            aria-label="End call"
            className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Caller */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 gap-1">
        <div className="relative mb-3">
          <div className="w-28 h-28 rounded-full gold-gradient flex items-center justify-center">
            <Sparkles className="w-11 h-11 text-white/90" />
          </div>
          {avatarPulse && (
            <span className="absolute inset-0 rounded-full border-2 border-[#A98946] animate-ping" />
          )}
          {connected && (listening || status.speaking || status.suspended) && (
            <span
              className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-[#171716] ${
                listening ? 'bg-red-400 animate-pulse' : 'bg-[#A98946]'
              }`}
            />
          )}
        </div>
        <p className="font-serif text-2xl font-semibold">{name}</p>
        <p className="text-[11px] font-sans-ui text-white/55 uppercase letter-luxury">{title}</p>

        <p className="mt-4 text-[13px] font-sans-ui text-white/80 flex items-center gap-1.5">
          {status.speaking || status.suspended ? (
            <span className="flex items-end gap-[2px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-[#A98946] animate-bounce"
                  style={{ height: `${7 + i * 3}px`, animationDelay: `${i * 120}ms` }}
                />
              ))}
            </span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          )}
          {statusText}
        </p>

        <p className="mt-1 text-[12px] font-sans-ui tabular-nums text-white/45">
          {fmt(elapsed)}
          {muted && ' · Muted'}
          {speakerOn && ' · Speaker'}
        </p>
      </div>

      {/* Caption strip */}
      {connected && caption && (
        <div className="px-4 pb-4 shrink-0">
          <div className="mx-auto max-w-[340px] bg-black/35 border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
            <Mic className={`w-3.5 h-3.5 shrink-0 ${listening ? 'text-red-400 animate-pulse' : 'text-white/40'}`} />
            <p className="flex-1 text-[11.5px] font-sans-ui leading-snug text-white/85 line-clamp-2">
              {caption}
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="shrink-0 px-6 pt-2 pb-5 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <CallButton
            active={muted}
            label="Mute"
            icon={muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            onClick={onToggleMute}
          />
          <CallButton
            active={speakerOn}
            label="Speaker"
            icon={<Speaker className="w-5 h-5" />}
            onClick={onToggleSpeaker}
          />
          <CallButton
            active={keypadOpen}
            label="Keypad"
            icon={<LayoutGrid className="w-5 h-5" />}
            onClick={onKeypadToggle}
          />
          <CallButton
            active={!muted}
            label="Volume"
            icon={muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            onClick={onToggleMute}
          />
        </div>
        <button
          type="button"
          onClick={onEnd}
          aria-label="End call"
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg shadow-red-900/40"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

      {/* Keypad overlay */}
      {keypadOpen && connected && (
        <div className="absolute inset-0 z-20 bg-black/55 flex items-end" onClick={onKeypadToggle}>
          <div
            className="w-full bg-[#171716] rounded-t-2xl px-5 pt-4 pb-6 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-sans-ui uppercase letter-luxury text-white/55">
                Type your answer — say it, or tap the digits
              </p>
              <button
                type="button"
                onClick={onKeypadToggle}
                aria-label="Close keypad"
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 bg-[#22221F] rounded-xl px-3 py-2.5">
              <span className="flex-1 tabular-nums text-sm text-white break-all min-h-[1.25rem]">
                {draft || <span className="text-white/35">e.g. 0803 555 7190</span>}
              </span>
              {draft && (
                <>
                  <button
                    type="button"
                    onClick={onDraftBackspace}
                    aria-label="Delete last digit"
                    className="p-1.5 rounded-full hover:bg-white/10 text-white/70 cursor-pointer"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onDraftClear}
                    aria-label="Clear"
                    className="p-1.5 rounded-full hover:bg-white/10 text-white/70 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {KEYS.map((k) => (
                <Key key={k} label={k} onClick={() => keytap(k)} />
              ))}
            </div>
            <button
              type="button"
              onClick={onDraftSend}
              disabled={!draft.trim()}
              className="w-full gold-gradient text-white text-[11px] font-semibold uppercase letter-luxury font-sans-ui py-2.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Send {draft.trim() ? `“${draft.trim()}”` : ''}
            </button>
          </div>
        </div>
      )}

      {/* Bottom sheet (property cards / booking) */}
      {sheetOpen && (
        <div className="absolute inset-0 z-20 bg-black/45 flex items-end" onClick={onCloseSheet}>
          <div
            className="w-full h-[min(62%,520px)] bg-[#F7F4EE] rounded-t-2xl flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#DED7CA] shrink-0">
              <p className="text-[11px] font-semibold uppercase letter-luxury text-[#A98946] font-sans-ui">
                {sheetTitle}
              </p>
              <button
                type="button"
                onClick={onCloseSheet}
                aria-label="Close panel"
                className="p-1.5 rounded-full hover:bg-black/5 text-[#625F58] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">{sheet}</div>
          </div>
        </div>
      )}
    </div>
  );
}