import { z } from "zod";

export const StyleNameSchema = z.enum(["Tech Bro", "Academic", "Deeply Personal"]);
export const PlatformSchema = z.enum(["X", "LinkedIn"]);
export const GenerateRequestSchema = z.object({
  transcript: z.string().trim().min(8, "Say a little more before generating.").max(6000, "That thought is too long. Please keep it under 6,000 characters."),
  platform: PlatformSchema,
  style: StyleNameSchema.optional(),
});
export const ContentStyleSchema = z.object({
  name: StyleNameSchema,
  platform: PlatformSchema,
  hook: z.string().trim().min(1).max(220),
  content: z.string().trim().min(1).max(3000),
  characterCount: z.number().int().nonnegative(),
});
export const GenerationSchema = z.object({
  sourceSummary: z.string().trim().min(1).max(500),
  styles: z.array(ContentStyleSchema).min(1).max(3),
});
export type Generation = z.infer<typeof GenerationSchema>;
export type ContentStyle = z.infer<typeof ContentStyleSchema>;
export type Platform = z.infer<typeof PlatformSchema>;
export type StyleName = z.infer<typeof StyleNameSchema>;

export function countCharacters(text: string) { return [...text].length; }
