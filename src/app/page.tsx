"use client";
import { useCallback, useEffect, useState } from "react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import type { ContentStyle, Generation, Platform, StyleName } from "@/lib/validation";

type Phase = "landing" | "ready" | "recording" | "processing" | "results";
const descriptions: Record<StyleName, string> = { "Tech Bro": "Punchy and high-conviction", Academic: "Thoughtful and structured", "Deeply Personal": "Warm and story-led" };
const processingLines = ["Untangling your thoughts…", "Finding the interesting bit…", "Cutting the waffle…", "Giving it a voice…", "Almost there…"];

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing"); const [platform, setPlatform] = useState<Platform>("X"); const [transcript, setTranscript] = useState(""); const [seconds, setSeconds] = useState(0); const [result, setResult] = useState<Generation | null>(null); const [mode, setMode] = useState<"demo" | "live" | null>(null); const [error, setError] = useState<string | null>(null); const [loadingStyle, setLoadingStyle] = useState<StyleName | null>(null); const [copied, setCopied] = useState<StyleName | null>(null);
  const appendTranscript = useCallback((value: string) => setTranscript((current) => `${current}${current && !current.endsWith(" ") ? " " : ""}${value}`), []);
  const speech = useSpeechRecognition(appendTranscript);
  const stopSpeech = speech.stop;
  useEffect(() => {
    if (phase !== "recording") return;
    const id = window.setInterval(() => {
      setSeconds((value) => {
        const next = value + 1;
        if (next >= 60) {
          stopSpeech();
          setPhase("ready");
          return 60;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, stopSpeech]);
  const generate = async (style?: StyleName) => {
    if (transcript.trim().length < 8) { setError("Say or type a little more before we turn it into a post."); return; }
    setError(null); if (style) setLoadingStyle(style); else setPhase("processing");
    try { const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript, platform, style }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setMode(body.mode); if (style && result) setResult({ ...result, sourceSummary: body.sourceSummary, styles: result.styles.map((item) => item.name === style ? body.styles[0] : item) }); else setResult(body); setPhase("results"); } catch (caught) { setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again."); setPhase("ready"); } finally { setLoadingStyle(null); }
  };
  const beginRecording = () => { setError(null); setSeconds(0); if (speech.start()) setPhase("recording"); };
  const finish = () => { speech.stop(); setPhase("ready"); };
  const reset = () => { speech.stop(); setTranscript(""); setSeconds(0); setResult(null); setError(null); setPhase("ready"); };
  const copy = async (item: ContentStyle) => { try { await navigator.clipboard.writeText(`${item.hook}\n\n${item.content}`); setCopied(item.name); window.setTimeout(() => setCopied(null), 1800); } catch { setError("Copying was blocked by your browser. Select the text and copy it manually."); } };
  const timer = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")} / 01:00`;
  if (phase === "landing") return <main className="landing"><nav><span className="brand">ghostwriter<span>.</span></span><button className="text-button" onClick={() => setPhase("ready")}>Open studio <span>↗</span></button></nav><section className="hero"><p className="eyebrow">VOICE → CLARITY</p><h1>Say it messy.<br />Post it <em>clearly.</em></h1><p className="lede">Ghostwriter turns your unfiltered thoughts into content worth posting.</p><button className="primary" onClick={() => setPhase("ready")}>Start speaking <span>→</span></button><p className="microcopy">60 seconds. 3 voices. 1 idea worth sharing.</p></section><section className="preview" aria-label="Content transformation preview"><div><small>RAW THOUGHT</small><p>“I keep thinking about why we wait until an idea is perfect…”</p></div><i>→</i><div><small>THREE CLEAR VOICES</small><p>Strong hook. Useful point. Your voice, intact.</p></div></section></main>;
  return <main className="studio"><header><button className="brand home" onClick={() => setPhase("landing")}>ghostwriter<span>.</span></button><div className="platforms" aria-label="Choose social platform">{(["X", "LinkedIn"] as Platform[]).map((item) => <button key={item} className={platform === item ? "active" : ""} onClick={() => setPlatform(item)} disabled={phase === "processing" || phase === "recording"}>{item}</button>)}</div></header><section className="workspace">{phase === "results" && result ? <Results result={result} mode={mode} copied={copied} loadingStyle={loadingStyle} onCopy={copy} onRegenerate={generate} onStartAgain={reset} /> : phase === "processing" ? <Processing /> : <Recorder recording={phase === "recording"} transcript={transcript} interim={speech.interim} seconds={timer} error={error ?? speech.error} supported={speech.supported} onStart={beginRecording} onFinish={finish} onGenerate={() => generate()} onTranscript={setTranscript} />}</section></main>;
}

function Recorder({ recording, transcript, interim, seconds, error, supported, onStart, onFinish, onGenerate, onTranscript }: { recording: boolean; transcript: string; interim: string; seconds: string; error: string | null; supported: boolean; onStart(): void; onFinish(): void; onGenerate(): void; onTranscript(value: string): void }) { return <div className="recorder"><p className="eyebrow">{recording ? "LIVE TRANSCRIPTION" : "YOUR NEXT POST STARTS HERE"}</p><h1>{recording ? "Keep going." : "What’s on your mind?"}</h1><p className="lede">{recording ? seconds : "Speak freely. We’ll clean it up later."}</p><button className={`mic ${recording ? "listening" : ""}`} onClick={recording ? onFinish : onStart} aria-label={recording ? "Finish recording" : "Start speaking"}>{recording ? <><b className="stop" /> <span>Finish</span></> : <><b>●</b><span>Start speaking</span></>}</button>{recording && <div className="listening-label"><span /> Listening… <strong>{seconds}</strong></div>}<div className="transcript-wrap"><label htmlFor="transcript">{recording ? "Hearing you say" : "Or write it out"}</label><textarea id="transcript" value={transcript} onChange={(event) => onTranscript(event.target.value)} placeholder={supported ? "Your thought will appear here as you speak…" : "Paste or write your thought here…"} aria-live="polite" /><span className="interim">{interim}</span></div>{error && <p className="error" role="alert">{error}</p>}{!recording && <button className="generate" onClick={onGenerate} disabled={transcript.trim().length < 8}>Turn this into posts <span>→</span></button>}<p className="privacy">Speech is converted to text in your browser. Nothing is recorded.</p></div> }
function Processing() { const [index, setIndex] = useState(0); useEffect(() => { const id = setInterval(() => setIndex((value) => (value + 1) % processingLines.length), 1150); return () => clearInterval(id); }, []); return <div className="processing" aria-live="polite"><div className="spinner" /><p className="eyebrow">GHOSTWRITER AT WORK</p><h1>{processingLines[index]}</h1><p className="lede">Turning one raw thought into three clear ways to say it.</p></div> }
function Results({ result, mode, copied, loadingStyle, onCopy, onRegenerate, onStartAgain }: { result: Generation; mode: "demo" | "live" | null; copied: StyleName | null; loadingStyle: StyleName | null; onCopy(item: ContentStyle): void; onRegenerate(style: StyleName): void; onStartAgain(): void }) { return <div className="results"><div className="results-head"><div><p className="eyebrow">YOUR IDEA, CLARIFIED {mode === "demo" && <span className="demo">DEMO MODE</span>}</p><h1>Here’s what you were<br />trying to say.</h1></div><button className="outline" onClick={onStartAgain}>+ Start again</button></div>{mode === "demo" && <p className="demo-note">Demo mode is showing sample transformations because no OpenAI API key is configured.</p>}<p className="summary">“{result.sourceSummary}”</p><div className="cards">{result.styles.map((item, index) => <article className="card" key={item.name} style={{ animationDelay: `${index * 100}ms` }}><div className="card-top"><div><p className="style-name">{item.name}</p><p className="style-description">{descriptions[item.name]}</p></div><span className="badge">{item.platform}</span></div><h2>{item.hook}</h2><p className="content">{item.content}</p><footer><span>{item.characterCount.toLocaleString()} characters</span><div><button className="icon-button" onClick={() => onRegenerate(item.name)} disabled={loadingStyle === item.name}>{loadingStyle === item.name ? "Rewriting…" : "Regenerate"}</button><button className="copy" onClick={() => onCopy(item)}>{copied === item.name ? "Copied ✓" : "Copy"}</button></div></footer></article>)}</div></div> }
