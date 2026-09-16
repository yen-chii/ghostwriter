import type { Platform, StyleName } from "./validation";

const styles: Record<StyleName, string> = {
  "Tech Bro": "Punchy, confident, concise and X-native. Lead with a strong hook, use short lines and useful insight. Never manufacture controversy, buzzwords, or certainty.",
  Academic: "Thoughtful, analytical and structured for LinkedIn. Give the idea context, use clear reasoning and a measured conclusion. Do not imply claims are proven without support.",
  "Deeply Personal": "Conversational, emotionally intelligent and story-led. Preserve only experiences actually described, with specific human language. Avoid therapy-speak, manufactured vulnerability, and clichés.",
};

export function buildGenerationPrompt(transcript: string, platform: Platform, requestedStyle?: StyleName) {
  const requested = requestedStyle ? [requestedStyle] : ["Tech Bro", "Academic", "Deeply Personal"] as StyleName[];
  return `You are Ghostwriter, an editorial coach. Transform a user's spoken thought into ${requested.length} distinct social post(s). Preserve factual claims and the user's personality. Never invent experiences, metrics, events, or sources. Remove filler and identify the strongest real idea.\n\nTarget platform: ${platform}. ${platform === "X" ? "Keep each post concise, scannable, and thread-aware." : "Use readable paragraphs with professional, human context."}\n\nRequested voices:\n${requested.map((name) => `- ${name}: ${styles[name]}`).join("\n")}\n\nReturn only JSON matching this shape: { sourceSummary: string, styles: [{ name: ${requested.map((name) => `\"${name}\"`).join(" | ")}, platform: \"${platform}\", hook: string, content: string, characterCount: number }] }. characterCount must exactly equal hook + two newlines + content.\n\nTranscript:\n${transcript}`;
}
