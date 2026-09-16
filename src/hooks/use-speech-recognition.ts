"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Recognition = EventTarget & { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; onresult: ((event: SpeechRecognitionEvent) => void) | null; onerror: ((event: SpeechRecognitionErrorEvent) => void) | null; onend: (() => void) | null };
type SpeechRecognitionEvent = Event & { resultIndex: number; results: { isFinal: boolean; [index: number]: { transcript: string } }[] };
type SpeechRecognitionErrorEvent = Event & { error: string };
type WindowWithSpeech = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

export function useSpeechRecognition(onFinal: (value: string) => void, onEnd?: () => void) {
  const recognition = useRef<Recognition | null>(null);
  const [supported] = useState(() => {
    if (typeof window === "undefined") return true;
    const speechWindow = window as WindowWithSpeech;
    return Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition);
  });
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const start = useCallback(() => {
    const Ctor = (window as WindowWithSpeech).SpeechRecognition || (window as WindowWithSpeech).webkitSpeechRecognition;
    if (!Ctor) { setError("Speech recognition is not supported in this browser. Try Chrome or Edge, or paste your thought below."); return false; }
    setError(null); setInterim(""); const instance = new Ctor(); recognition.current = instance;
    instance.continuous = true; instance.interimResults = true; instance.lang = "en-GB";
    instance.onresult = (event) => { let finalText = ""; let interimText = ""; for (let i = event.resultIndex; i < event.results.length; i++) { const text = event.results[i][0]?.transcript ?? ""; if (event.results[i].isFinal) finalText += text; else interimText += text; } if (finalText) onFinal(finalText); setInterim(interimText); };
    instance.onerror = (event) => { const messages: Record<string, string> = { "not-allowed": "Microphone access was denied. Allow it in your browser settings and try again.", "no-speech": "We didn't catch that. Try speaking a little closer to your microphone.", "audio-capture": "No microphone was found. You can still type or paste your thought.", network: "Speech recognition could not reach the browser service. Check your connection or type your thought below." }; setError(messages[event.error] ?? "Speech recognition stopped unexpectedly. You can try again."); };
    instance.onend = () => { if (recognition.current === instance) recognition.current = null; setInterim(""); onEnd?.(); };
    try { instance.start(); return true; } catch { recognition.current = null; setError("Speech recognition could not start. Try again, or type your thought below."); return false; }
  }, [onEnd, onFinal]);
  const stop = useCallback(() => { const instance = recognition.current; recognition.current = null; try { instance?.stop(); } catch { /* The browser may already have ended the session. */ } setInterim(""); }, []);
  useEffect(() => () => { try { recognition.current?.stop(); } catch { /* Nothing to clean up. */ } }, []);
  return { supported, interim, error, start, stop, clearError: () => setError(null) };
}
