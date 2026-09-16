import type { Generation, Platform, StyleName } from "./validation";
import { countCharacters } from "./validation";

const blur = (text: string) => text.replace(/\s+/g, " ").trim();
export function demoGeneration(transcript: string, platform: Platform, oneStyle?: StyleName): Generation {
  const idea = blur(transcript);
  const summary = idea.length > 155 ? `${idea.slice(0, 152)}…` : idea;
  const copy: Record<StyleName, { hook: string; content: string }> = {
    "Tech Bro": { hook: "The useful idea is usually hiding in the ramble.", content: `I kept coming back to this: ${summary}\n\nSay the thing before it is polished. Then make it useful.\n\nClarity is an editing problem — not a thinking problem.` },
    Academic: { hook: "A clearer way to frame the idea:", content: `${summary}\n\nThe underlying point is not simply about having a good thought. It is about giving an emerging idea enough structure to be understood, tested, and shared.\n\nThat small shift changes how we communicate what we are learning.` },
    "Deeply Personal": { hook: "I nearly talked myself out of saying this.", content: `${summary}\n\nIt was messy when I first said it out loud. But the more I sat with it, the more I realised that was the point.\n\nSometimes you do not need a perfect thought. You need an honest place to begin.` },
  };
  const names = oneStyle ? [oneStyle] : (["Tech Bro", "Academic", "Deeply Personal"] as StyleName[]);
  return { sourceSummary: summary, styles: names.map((name) => { const item = copy[name]; return { name, platform, ...item, characterCount: countCharacters(`${item.hook}\n\n${item.content}`) }; }) };
}
