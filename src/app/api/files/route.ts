import { NextRequest, NextResponse } from "next/server";
import { uploadDeliverableFile } from "@/lib/files";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const methodologyId = formData.get("methodologyId") as string;
  const phaseId = formData.get("phaseId") as string;
  const file = formData.get("file") as File;

  if (!methodologyId || !phaseId || !file) {
    return NextResponse.json(
      { error: "methodologyId, phaseId, file are required" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadDeliverableFile(
    methodologyId,
    phaseId,
    file.name,
    buffer,
    file.type
  );

  return NextResponse.json(uploaded);
}
