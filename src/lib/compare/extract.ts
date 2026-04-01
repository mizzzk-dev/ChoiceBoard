import { load } from "cheerio";
import type { BillingCycle, Confidence, Currency, NormalizedPlan, PriceState, SourceResult } from "@/types/compare";

const MAX_HTML_BYTES = 800_000;
const FETCH_TIMEOUT_MS = 12_000;

type RawPlan = {
  serviceName: string;
  planName: string;
  rawText: string;
};

function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = "";
  return parsed.toString();
}

async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const text = await response.text();
    if (new TextEncoder().encode(text).length > MAX_HTML_BYTES) {
      throw new Error("HTML too large");
    }

    return text;
  } finally {
    clearTimeout(timer);
  }
}

function detectCurrency(text: string): Currency {
  if (/\$|usd/i.test(text)) return "USD";
  if (/¥|jpy|円/i.test(text)) return "JPY";
  return "Unknown";
}

function detectCycle(text: string): BillingCycle {
  if (/month|monthly|\/mo/i.test(text)) return "monthly";
  if (/year|annual|yearly|\/yr/i.test(text)) return "annual";
  return "unknown";
}

function detectPriceState(text: string): PriceState {
  if (/free trial/i.test(text)) return "trial";
  if (/free/i.test(text)) return "free";
  if (/contact sales|contact us|talk to sales/i.test(text)) return "contact_sales";
  return "unknown";
}

function detectAmount(text: string): number | null {
  const match = text.match(/(?:\$|¥)?\s?(\d{1,4}(?:[.,]\d{1,2})?)/);
  if (!match) return null;
  return Number(match[1].replace(",", ""));
}

function decideConfidence(plan: Omit<NormalizedPlan, "confidence">): Confidence {
  const hasPrice = plan.priceAmount !== null && plan.currency !== "Unknown";
  const hasState = plan.priceState !== "unknown";
  const hasCycle = plan.billingCycle !== "unknown";

  if (hasPrice && hasState && hasCycle) return "high";
  if ((hasPrice && hasState) || (hasPrice && hasCycle) || (hasState && hasCycle)) return "medium";
  return "low";
}

function extractRawPlans(html: string, fallbackServiceName: string): RawPlan[] {
  const $ = load(html);
  const serviceName = $("meta[property='og:site_name']").attr("content")?.trim() || $("title").text().trim() || fallbackServiceName;
  const plans: RawPlan[] = [];

  $("section, article, div").each((_, element) => {
    const text = $(element).text().replace(/\s+/g, " ").trim();
    if (text.length < 8) return;
    if (!/(plan|pricing|month|year|free|\$|¥|contact)/i.test(text)) return;

    const heading = $(element).find("h1,h2,h3,h4,strong").first().text().trim();
    if (!heading) return;

    plans.push({
      serviceName,
      planName: heading.slice(0, 80),
      rawText: text.slice(0, 280)
    });
  });

  return plans.slice(0, 20);
}

function normalizePlan(raw: RawPlan): NormalizedPlan {
  const base = {
    serviceName: raw.serviceName,
    planName: raw.planName,
    priceAmount: detectAmount(raw.rawText),
    currency: detectCurrency(raw.rawText),
    billingCycle: detectCycle(raw.rawText),
    priceState: detectPriceState(raw.rawText),
    note: "Deterministic extraction"
  };

  return {
    ...base,
    confidence: decideConfidence(base)
  };
}

export async function processSource(url: string): Promise<SourceResult> {
  const normalizedUrl = normalizeUrl(url);
  try {
    const html = await fetchHtml(normalizedUrl);
    const rawPlans = extractRawPlans(html, new URL(normalizedUrl).hostname);

    if (rawPlans.length === 0) {
      return {
        url,
        normalizedUrl,
        status: "parse_error",
        caution: "No pricing-like blocks found. Treated as unconfirmed.",
        plans: []
      };
    }

    return {
      url,
      normalizedUrl,
      status: "ok",
      plans: rawPlans.map(normalizePlan)
    };
  } catch (error) {
    return {
      url,
      normalizedUrl,
      status: "fetch_error",
      caution: `Failed to fetch source: ${error instanceof Error ? error.message : "unknown error"}`,
      plans: []
    };
  }
}
