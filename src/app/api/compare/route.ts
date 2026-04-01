import { NextResponse } from "next/server";
import { runCompare } from "@/lib/compare/run-compare";
import { compareInputSchema } from "@/lib/validation/compare";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = compareInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid input",
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const job = await runCompare(parsed.data);
  return NextResponse.json({ jobId: job.id, status: job.status });
}
