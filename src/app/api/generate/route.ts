import OpenAI from "openai";
import { NextResponse } from "next/server";
import { demoGeneration } from "@/lib/demo";
import { buildGenerationPrompt } from "@/lib/prompts";
import { GenerationSchema, GenerateRequestSchema } from "@/lib/validation";

const generationJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["sourceSummary", "styles"],
  properties: {
    sourceSummary: { type: "string" },
    styles: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "platform", "hook", "content", "characterCount"],
        properties: {
          name: { type: "string", enum: ["Tech Bro", "Academic", "Deeply Personal"] },
          platform: { type: "string", enum: ["X", "LinkedIn"] },
          hook: { type: "string" },
          content: { type: "string" },
          characterCount: { type: "integer" },
        },
      },
    },
  },
} as const;

export async function POST(request: Request) {
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Please send a valid request." }, { status: 400 }); }
  const parsed = GenerateRequestSchema.safeParse(input);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  const { transcript, platform, style } = parsed.data;
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ ...demoGeneration(transcript, platform, style), mode: "demo" });
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: buildGenerationPrompt(transcript, platform, style),
      text: { format: { type: "json_schema", name: "ghostwriter_generation", strict: true, schema: generationJsonSchema } },
    });
    const json = JSON.parse(response.output_text);
    const result = GenerationSchema.safeParse(json);
    if (!result.success) return NextResponse.json({ error: "The writing service returned an incomplete response. Please try again." }, { status: 502 });
    return NextResponse.json({ ...result.data, mode: "live" });
  } catch {
    return NextResponse.json({ error: "We couldn't generate your posts right now. Please try again in a moment." }, { status: 502 });
  }
}
