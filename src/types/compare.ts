export type Currency = "USD" | "JPY" | "Unknown";
export type BillingCycle = "monthly" | "annual" | "unknown";
export type PriceState = "free" | "trial" | "contact_sales" | "unknown";
export type Confidence = "high" | "medium" | "low";
export type JobStatus = "processing" | "completed" | "failed";

export type NormalizedPlan = {
  serviceName: string;
  planName: string;
  priceAmount: number | null;
  currency: Currency;
  billingCycle: BillingCycle;
  priceState: PriceState;
  confidence: Confidence;
  note: string;
};

export type SourceResult = {
  url: string;
  normalizedUrl: string;
  status: "ok" | "fetch_error" | "parse_error";
  caution?: string;
  plans: NormalizedPlan[];
};

export type CompareJob = {
  id: string;
  status: JobStatus;
  createdAt: string;
  inputUrls: string[];
  cautions: string[];
  sources: SourceResult[];
};
