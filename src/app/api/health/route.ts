import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ status: "ok", database: "not_configured" });
  }

  const { error } = await supabase
    .from("phase_overrides")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json(
      { status: "error", database: "unreachable", message: error.message },
      { status: 503 }
    );
  }

  return NextResponse.json({ status: "ok", database: "connected" });
}
