import { randomUUID } from "crypto";
import { processSource } from "@/lib/compare/extract";
import { jobStore } from "@/lib/store/job-store";
import type { CompareInput } from "@/lib/validation/compare";
import type { CompareJob } from "@/types/compare";

export async function runCompare(input: CompareInput): Promise<CompareJob> {
  const id = randomUUID();
  const base: CompareJob = {
    id,
    status: "processing",
    createdAt: new Date().toISOString(),
    inputUrls: input.inputUrls,
    cautions: [],
    sources: []
  };

  jobStore.save(base);

  const sources = await Promise.all(input.inputUrls.map((url) => processSource(url)));
  const cautions = sources.flatMap((source) => (source.caution ? [source.caution] : []));

  const completed: CompareJob = {
    ...base,
    status: "completed",
    sources,
    cautions
  };

  jobStore.save(completed);
  return completed;
}
