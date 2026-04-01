import { ConfidenceBadge } from "@/components/confidence-badge";
import type { SourceResult } from "@/types/compare";

export function ComparisonTable({ sources }: { sources: SourceResult[] }) {
  const rows = sources.flatMap((source) =>
    source.plans.map((plan) => ({
      sourceUrl: source.normalizedUrl,
      ...plan
    }))
  );

  if (rows.length === 0) {
    return (
      <div className="card">
        <h3>Comparison</h3>
        <p>抽出結果がありません。未確認データとして扱ってください。</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Comparison</h3>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Plan</th>
            <th>Price</th>
            <th>Cycle</th>
            <th>Price State</th>
            <th>Confidence</th>
            <th>Source URL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.sourceUrl}-${row.planName}-${index}`}>
              <td>{row.serviceName}</td>
              <td>{row.planName}</td>
              <td>{row.priceAmount === null ? "Unknown" : `${row.priceAmount} ${row.currency}`}</td>
              <td>{row.billingCycle}</td>
              <td>{row.priceState}</td>
              <td>
                <ConfidenceBadge confidence={row.confidence} />
              </td>
              <td>{row.sourceUrl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
