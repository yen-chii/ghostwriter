import { describe, expect, it } from "vitest";
import { buildGenerationPrompt } from "./prompts";
import { countCharacters, GenerateRequestSchema, GenerationSchema } from "./validation";

describe("generation validation", () => {
  it("rejects a too-short transcript", () => expect(GenerateRequestSchema.safeParse({ transcript: "short", platform: "X" }).success).toBe(false));
  it("accepts a valid request", () => expect(GenerateRequestSchema.safeParse({ transcript: "This is a real thought to share.", platform: "LinkedIn" }).success).toBe(true));
  it("validates a structured generation", () => expect(GenerationSchema.safeParse({ sourceSummary: "Idea", styles: [{ name: "Academic", platform: "X", hook: "Hook", content: "Body", characterCount: 10 }] }).success).toBe(true));
});
describe("writing helpers", () => {
  it("counts Unicode characters", () => expect(countCharacters("a✨")).toBe(2));
  it("includes platform and requested style in prompt", () => { const prompt = buildGenerationPrompt("A thoughtful idea worth sharing.", "X", "Academic"); expect(prompt).toContain("Target platform: X"); expect(prompt).toContain("Academic"); });
});
