import { describe, expect, test } from "vitest";
import { compareInputSchema } from "../src/lib/validation/compare";

describe("compareInputSchema", () => {
  test("accepts 1 to 3 urls", () => {
    const result = compareInputSchema.safeParse({
      inputUrls: ["https://example.com/pricing", "https://example.org/plans"]
    });

    expect(result.success).toBe(true);
  });

  test("rejects duplicated urls", () => {
    const result = compareInputSchema.safeParse({
      inputUrls: ["https://example.com/pricing", "https://example.com/pricing#section"]
    });

    expect(result.success).toBe(false);
  });

  test("rejects more than three urls", () => {
    const result = compareInputSchema.safeParse({
      inputUrls: [
        "https://a.com",
        "https://b.com",
        "https://c.com",
        "https://d.com"
      ]
    });

    expect(result.success).toBe(false);
  });
});
