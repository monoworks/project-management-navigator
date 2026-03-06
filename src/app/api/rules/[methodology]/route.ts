import { NextRequest, NextResponse } from "next/server";
import { waterfallRules, agileRules } from "@/data/management-rules";
import {
  getRulesWithOverrides,
  saveRuleOverride,
  addCustomRule,
  deleteRule,
} from "@/lib/rules";

const rulesMap: Record<string, typeof waterfallRules> = {
  waterfall: waterfallRules,
  agile: agileRules,
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ methodology: string }> }
) {
  const { methodology } = await params;
  const staticRules = rulesMap[methodology];
  if (!staticRules) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const merged = await getRulesWithOverrides(methodology, staticRules);
  return NextResponse.json(merged);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ methodology: string }> }
) {
  const { methodology } = await params;
  const staticRules = rulesMap[methodology];
  if (!staticRules) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { ruleId, description, items } = body;

  if (!ruleId) {
    return NextResponse.json({ error: "Invalid rule" }, { status: 400 });
  }

  await saveRuleOverride(methodology, ruleId, { description, items });
  return NextResponse.json({ success: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ methodology: string }> }
) {
  const { methodology } = await params;
  if (!rulesMap[methodology]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { id, category, description, items } = body;

  if (!id || !category) {
    return NextResponse.json(
      { error: "id and category are required" },
      { status: 400 }
    );
  }

  try {
    await addCustomRule(methodology, {
      id,
      category,
      description: description || "",
      items: items || [],
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add rule" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ methodology: string }> }
) {
  const { methodology } = await params;
  if (!rulesMap[methodology]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { ruleId } = body;

  if (!ruleId) {
    return NextResponse.json({ error: "ruleId is required" }, { status: 400 });
  }

  try {
    await deleteRule(methodology, ruleId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete rule" },
      { status: 500 }
    );
  }
}
