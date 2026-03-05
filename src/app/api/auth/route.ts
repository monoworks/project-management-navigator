import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const correctPassword = process.env.AUTH_PASSWORD || "admin";

  if (password === correctPassword) {
    const token = Buffer.from(`authenticated:${Date.now()}`).toString("base64");
    return NextResponse.json({ success: true, token });
  }

  return NextResponse.json({ success: false, message: "パスワードが正しくありません" }, { status: 401 });
}
