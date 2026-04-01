import { NextResponse } from "next/server";
import { jobStore } from "@/lib/store/job-store";

export async function GET(_: Request, context: { params: Promise<{ jobId: string }> }) {
  const params = await context.params;
  const job = jobStore.get(params.jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}
