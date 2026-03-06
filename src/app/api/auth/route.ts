import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const editorPassword = process.env.AUTH_PASSWORD || "admin";
  const viewerPassword = process.env.AUTH_VIEWER_PASSWORD || "viewer";

  if (password === editorPassword) {
    const token = Buffer.from(`editor:${Date.now()}`).toString("base64");
    return NextResponse.json({ success: true, token, role: "editor" });
  }

  if (password === viewerPassword) {
    const token = Buffer.from(`viewer:${Date.now()}`).toString("base64");
    return NextResponse.json({ success: true, token, role: "viewer" });
  }

  return NextResponse.json({ success: false, message: "パスワードが正しくありません" }, { status: 401 });
}
