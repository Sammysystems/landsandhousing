import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  startListening,
  stopListening,
  stopSpeaking,
  stopAll,
  speak as engineSpeak,
} from '../lib/voice-engine';

/**
 * VoiceAgent — the voice engine controller for the concierge.
 *
 * It owns the (single) recognition + speech-synthesis session and reports its
 * live state upward through `onStatus`. The mic and mute flags are CONTROLLED by
 * the parent (single source of truth shared by the chat composer and the call
 * screen), so only one engine instance is ever alive — it survives view
 * switches between chat and the call UI.
 *
 * Rendered UI: only the interim/status pill (chat view). The mic/mute buttons
 * live in the view that needs them and drive this component through the props.
 *
 * Echo-safe duplex: the mic is suspended while the agent speaks and resumes on
 * end — she never hears herself, so no feedback loop.
 */

export type VoiceStatus = {
  micOn: boolean;
  listening: boolean;
  suspended: boolean;
  speaking: boolean;
  muted: boolean;
  interim: string;
};

export type VoiceAgentHandle = {
  speak: (text: string) => void;
  stop: () => void;
  /** Silence an in-flight reply without touching the microphone session. */
  cut: () => void;
};

type Props = {
  /** Panel open — false stops everything. */
  enabled: boolean;
  /** Controlled mic intent. */
  micOn: boolean;
  /** Controlled mute for spoken replies. */
  muted: boolean;
  onMicChange: (on: boolean) => void;
  onMutedChange: (muted: boolean) => void;
  onTranscript: (text: string) => void;
  onStatus: (status: VoiceStatus) => void;
  /** Chat view shows the pill; the call screen renders its own status. */
  pillVisible: boolean;
};

const NOTICE_MS = 4200;

const DEFAULT_STATUS: VoiceStatus = {
  micOn: false,
  listening: false,
  suspended: false,
  speaking: false,
  muted: false,
  interim: '',
};

const VoiceAgent = forwardRef<VoiceAgentHandle, Props>(
  function VoiceAgent(
    { enabled, micOn, muted, onMicChange, onMutedChange, onTranscript, onStatus, pillVisible },
    ref,
  ) {
    const [suspended, setSuspended] = useState(false);
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [interim, setInterim] = useState('');
    const [notice, setNotice] = useState<string | null>(null);

    const latest = useRef({ onTranscript, onMicChange, onMutedChange });
    latest.current = { onTranscript, onMicChange, onMutedChange };

    const listeningRef = useRef(false);
    const speakingRef = useRef(false);
    const noticeTimer = useRef<number | null>(null);
    const speakId = useRef(0);

    const beginListen = useCallback(() => {
      listeningRef.current = true;
      setListening(true);
      setSuspended(false);
      setInterim('');
      setNotice(null);
      stopSpeaking();
      speakingRef.current = false;
      setSpeaking(false);
      startListening({
        onInterim: (t) => setInterim(t),
        onFinal: (t) => {
          setInterim('');
          latest.current.onTranscript(t);
        },
        onError: (msg) => {
          listeningRef.current = false;
          setListening(false);
          setNotice(msg);
          if (noticeTimer.current !== null) clearTimeout(noticeTimer.current);
          noticeTimer.current = window.setTimeout(() => setNotice(null), NOTICE_MS);
        },
      });
    }, []);

    const stopMic = useCallback(() => {
      listeningRef.current = false;
      setListening(false);
      setSuspended(false);
      setInterim('');
      stopListening();
    }, []);

    // Controlled mic: reconcile intent with the engine.
    useEffect(() => {
      if (!enabled) return;
      if (micOn) {
        if (!listeningRef.current) beginListen();
      } else if (listeningRef.current) {
        stopMic();
      }
    }, [micOn, enabled, beginListen, stopMic]);

    // Full shutdown whenever the panel closes.
    useEffect(() => {
      if (!enabled) {
        listeningRef.current = false;
        speakingRef.current = false;
        setListening(false);
        setSuspended(false);
        setSpeaking(false);
        setInterim('');
        stopAll();
      }
      return () => {
        stopAll();
        if (noticeTimer.current !== null) clearTimeout(noticeTimer.current);
      };
    }, [enabled]);

    const resumeIfWanted = (id: number) => {
      if (id !== speakId.current || !listeningRef.current) return;
      beginListen();
    };

    useImperativeHandle(
      ref,
      () => ({
        speak: (text: string) => {
          const l = latest.current;
          if (muted || !text.trim()) return;
          const id = ++speakId.current;
          // Suspend hearing while we talk (echo guard); resume on end.
          if (listeningRef.current) {
            listeningRef.current = false;
            setListening(false);
            setSuspended(true);
          }
          speakingRef.current = true;
          setSpeaking(true);
          engineSpeak(text, {
            onEnd: () => {
              if (speakId.current === id) {
                speakingRef.current = false;
                setSpeaking(false);
              }
              resumeIfWanted(id);
            },
          });
        },
        stop: () => {
          stopMic();
          stopSpeaking();
          speakingRef.current = false;
          setSpeaking(false);
        },
        cut: () => {
          speakId.current++; // supersede any pending resume
          speakingRef.current = false;
          setSpeaking(false);
          stopSpeaking();
        },
      }),
      [muted, stopMic],
    );

    // Report live state upward.
    useEffect(() => {
      onStatus({
        micOn,
        listening,
        suspended,
        speaking,
        muted,
        interim: interim || notice || '',
      });
    }, [micOn, listening, suspended, speaking, muted, interim, notice, onStatus]);

    const pill = notice ?? (suspended ? 'Aisha is speaking…' : interim || (listening ? 'Listening…' : null));
    const pillVisibleNow = pillVisible && (listening || suspended || notice) && pill !== null;

    return (
      <>
        {pillVisibleNow && (
          <div className="absolute left-3 right-3 bottom-[84px] z-10 flex items-center gap-2 bg-[#171716] text-white rounded-xl px-3.5 py-2.5 shadow-xl">
            <span
              className={`w-2 h-2 rounded-full inline-block shrink-0 ${listening ? 'bg-red-400 animate-pulse' : 'bg-[#A98946]'}`}
            />
            <p className="flex-1 text-[12px] font-sans-ui leading-snug truncate" aria-live="polite">
              {pill}
            </p>
            {listening && (
              <button
                type="button"
                onClick={() => latest.current.onMicChange(false)}
                aria-label="Stop listening"
                className="text-[10px] font-semibold uppercase letter-luxury text-white/70 hover:text-white shrink-0 cursor-pointer"
              >
                Stop
              </button>
            )}
          </div>
        )}
      </>
    );
  },
);

export default VoiceAgent;