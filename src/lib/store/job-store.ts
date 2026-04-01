import type { CompareJob } from "@/types/compare";

class JobStore {
  private readonly jobs = new Map<string, CompareJob>();

  save(job: CompareJob): void {
    this.jobs.set(job.id, job);
  }

  get(id: string): CompareJob | undefined {
    return this.jobs.get(id);
  }
}

export const jobStore = new JobStore();
