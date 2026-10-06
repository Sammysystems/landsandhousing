import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Mic, Volume2, VolumeX } from 'lucide-react';
import {
  startListening,
  stopListening,
  stopSpeaking,
  stopAll,
  speak as engineSpeak,
  supportsVoice,
} from '../lib/voice-engine';

/**
 * VoiceAgent — the mic + spoken-reply controls for the concierge.
 *
 * Renders two controls for the composer: a speaker toggle (mute spoken replies)
 * and a mic button (tap to start/stop dictation). While listening, a live
 * interim-transcript pill floats above the composer, and while Aisha is speaking
 * the same pill (temporarily) says so.
 *
 * Echo-safe duplex: the mic is suspended while Aisha talks and automatically
 * resumes when she stops — so she never hears herself and no feedback loop forms.
 * Barge-in is still possible by tapping the mic at any time.
 *
 * The panel parent must be `relative`/positioned; the pill is absolutely placed
 * above the composer. Spoken replies are driven by the parent through the
 * imperative handle (`speak`).
 */

export type VoiceAgentHandle = {
  speak: (text: string) => void;
  stop: () => void;
};

type Props = {
  /** Panel is open — everything shuts down (listening + speech) when false. */
  enabled: boolean;
  /** Called when the visitor has said a complete phrase (final transcript). */
  onTranscript: (text: string) => void;
};

const NOTICE_MS = 4200;

const VoiceAgent = forwardRef<VoiceAgentHandle, Props>(
  function VoiceAgent({ enabled, onTranscript }, ref) {
    const [supported] = useState<boolean>(() => supportsVoice());
    const [muted, setMuted] = useState(false);
    const [micOn, setMicOn] = useState(false); // user intent
    const [suspended, setSuspended] = useState(false); // paused while giving a voice reply
    const [interim, setInterim] = useState('');
    const [notice, setNotice] = useState<string | null>(null);

    const latest = useRef({ enabled, micOn, muted, onTranscript, suspended });
    latest.current = { enabled, micOn, muted, onTranscript, suspended };

    const noticeTimer = useRef<number | null>(null);
    const speakId = useRef(0);

    const beginListen = () => {
      setSuspended(false);
      setInterim('');
      setNotice(null);
      stopSpeaking(); // fresh pickup interrupts anything Aisha was saying
      startListening({
        onInterim: (t) => setInterim(t),
        onFinal: (t) => {
          setInterim('');
          latest.current.onTranscript(t);
        },
        onError: (msg) => {
          stopMic();
          setNotice(msg);
        },
      });
    };

    const stopMic = () => {
      setMicOn(false);
      setSuspended(false);
      setInterim('');
      stopListening();
    };

    const toggleMic = () => {
      if (micOn || suspended) {
        stopMic();
        return;
      }
      setMicOn(true);
      beginListen();
    };

    // Full shutdown whenever the panel closes.
    useEffect(() => {
      if (!enabled) {
        setMicOn(false);
        setSuspended(false);
        setInterim('');
        stopAll();
      }
      return () => {
        stopAll();
        if (noticeTimer.current !== null) clearTimeout(noticeTimer.current);
      };
    }, [enabled]);

    const flash = (msg: string) => {
      setNotice(msg);
      if (noticeTimer.current !== null) clearTimeout(noticeTimer.current);
      noticeTimer.current = window.setTimeout(() => setNotice(null), NOTICE_MS);
    };

    const resumeIfWanted = (id: number) => {
      if (id !== speakId.current || !latest.current.enabled || !latest.current.micOn) return;
      beginListen();
    };

    useImperativeHandle(
      ref,
      () => ({
        speak: (text: string) => {
          const l = latest.current;
          if (l.muted || !text.trim()) return;
          const id = ++speakId.current;
          // Mic on? Suspend hearing while we talk (echo guard), resume on end.
          if (l.micOn && !l.suspended) {
            stopListening();
            setSuspended(true);
          }
          // Only the newest utterance carries the resume; superseded ones skip.
          engineSpeak(text, { onEnd: () => resumeIfWanted(id) });
        },
        stop: () => {
          stopMic();
          stopSpeaking();
        },
      }),
      [],
    );

    const micActive = (micOn || suspended) ? 'bg-[#A98946] text-white border-[#A98946]' : '';
    const pill =
      notice ??
      (suspended ? 'Aisha is speaking…' : interim || (micOn ? 'Listening…' : null));
    const listening = micOn && !suspended;

    return (
      <>
        {supported && enabled && pill && (
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
                onClick={stopMic}
                aria-label="Stop listening"
                className="text-[10px] font-semibold uppercase letter-luxury text-white/70 hover:text-white shrink-0 cursor-pointer"
              >
                Stop
              </button>
            )}
          </div>
        )}

        {supported ? (
          <>
            <button
              type="button"
              onClick={() => setMuted((v) => !v)}
              aria-label={muted ? 'Unmute spoken replies' : 'Mute spoken replies'}
              title={muted ? 'Aisha is muted — unmute to hear her' : 'Mute Aisha'}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-[#DED7CA] text-[#625F58] hover:border-[#A98946] hover:text-[#A98946] transition-colors shrink-0 cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={toggleMic}
              aria-pressed={micOn || suspended}
              aria-label={(micOn || suspended) ? 'Stop voice input' : 'Talk instead of typing'}
              title={(micOn || suspended) ? 'Stop listening' : 'Talk instead of typing'}
              className={`w-11 h-11 rounded-full flex items-center justify-center border border-[#A98946] text-[#A98946] hover:bg-[#A98946] hover:text-white transition-colors shrink-0 cursor-pointer ${micActive}`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            {enabled && (
              <p className="absolute left-3 right-3 bottom-[84px] z-10 text-center text-[10px] font-sans-ui text-[#9A968D]">
                Voice is available in Chrome, Edge or Safari — type anytime.
              </p>
            )}
            <button
              type="button"
              disabled
              aria-label="Voice not supported in this browser"
              title="Voice not supported in this browser"
              className="w-11 h-11 rounded-full flex items-center justify-center border border-[#DED7CA] text-[#C8C2B6] opacity-70 shrink-0 cursor-not-allowed"
            >
              <Mic className="w-4 h-4" />
            </button>
          </>
        )}
      </>
    );
  },
);

export default VoiceAgent;