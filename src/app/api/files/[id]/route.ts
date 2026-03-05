import { NextRequest, NextResponse } from "next/server";
import { deleteDeliverableFile } from "@/lib/files";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { filePath } = await request.json();

  if (!filePath) {
    return NextResponse.json(
      { error: "filePath is required" },
      { status: 400 }
    );
  }

  await deleteDeliverableFile(id, filePath);
  return NextResponse.json({ success: true });
}
