import { notFound } from "next/navigation";
import { CautionPanel } from "@/components/caution-panel";
import { ComparisonTable } from "@/components/comparison-table";
import { ProcessingStatus } from "@/components/processing-status";
import { jobStore } from "@/lib/store/job-store";

export default async function ResultPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = jobStore.get(jobId);

  if (!job) {
    notFound();
  }

  return (
    <main>
      <h1>Comparison Result</h1>
      <p>Job ID: {job.id}</p>
      {job.status === "processing" ? <ProcessingStatus /> : null}
      <ComparisonTable sources={job.sources} />
      <CautionPanel cautions={job.cautions} />
    </main>
  );
}
