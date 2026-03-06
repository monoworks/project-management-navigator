import { NextRequest, NextResponse } from "next/server";
import { getDeliverableFiles, uploadDeliverableFile } from "@/lib/files";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const methodologyId = searchParams.get("methodologyId");
  const phaseId = searchParams.get("phaseId");

  if (!methodologyId || !phaseId) {
    return NextResponse.json(
      { error: "methodologyId and phaseId are required" },
      { status: 400 }
    );
  }

  const files = await getDeliverableFiles(methodologyId, phaseId);
  return NextResponse.json(files);
}

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

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadDeliverableFile(
      methodologyId,
      phaseId,
      file.name,
      buffer,
      file.type
    );

    return NextResponse.json(uploaded);
  } catch (err) {
    console.error("File upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
