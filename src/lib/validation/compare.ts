import { z } from "zod";

const urlSchema = z.string().url();

export const compareInputSchema = z
  .object({
    inputUrls: z.array(urlSchema).min(1).max(3)
  })
  .superRefine((value, ctx) => {
    const normalized = value.inputUrls.map((url) => {
      try {
        const parsed = new URL(url);
        parsed.hash = "";
        return parsed.toString();
      } catch {
        return url;
      }
    });

    if (new Set(normalized).size !== normalized.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duplicate URLs are not allowed",
        path: ["inputUrls"]
      });
    }
  });

export type CompareInput = z.infer<typeof compareInputSchema>;
