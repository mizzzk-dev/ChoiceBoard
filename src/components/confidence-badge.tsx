import type { Confidence } from "@/types/compare";

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return <span className={`badge ${confidence}`}>{confidence.toUpperCase()}</span>;
}
