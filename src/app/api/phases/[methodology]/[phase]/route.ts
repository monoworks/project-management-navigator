import { NextRequest, NextResponse } from "next/server";
import { waterfall } from "@/data/waterfall";
import { agile } from "@/data/agile";
import { getPhaseWithOverrides, savePhaseOverride } from "@/lib/phases";
import { getDeliverableFiles } from "@/lib/files";

const methodologies: Record<string, typeof waterfall> = { waterfall, agile };

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ methodology: string; phase: string }> }
) {
  const { methodology, phase: phaseId } = await params;
  const methodology_data = methodologies[methodology];
  if (!methodology_data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const staticPhase = methodology_data.phases.find((p) => p.id === phaseId);
  if (!staticPhase) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const merged = await getPhaseWithOverrides(methodology, phaseId, staticPhase);
  const files = await getDeliverableFiles(methodology, phaseId);

  return NextResponse.json({ ...merged, files });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ methodology: string; phase: string }> }
) {
  const { methodology, phase: phaseId } = await params;
  const methodology_data = methodologies[methodology];
  if (!methodology_data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const staticPhase = methodology_data.phases.find((p) => p.id === phaseId);
  if (!staticPhase) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  await savePhaseOverride(methodology, phaseId, {
    description: body.description,
    approach: body.approach,
    cautions: body.cautions,
    deliverables: body.deliverables,
  });

  return NextResponse.json({ success: true });
}
