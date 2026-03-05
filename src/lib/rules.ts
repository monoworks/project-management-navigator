import { ManagementRule } from "@/types";
import { supabase } from "./supabase";

export async function getRulesWithOverrides(
  methodologyId: string,
  staticRules: ManagementRule[]
): Promise<ManagementRule[]> {
  if (!supabase) return staticRules;

  const { data } = await supabase
    .from("management_rule_overrides")
    .select("rule_id, description, items")
    .eq("methodology_id", methodologyId);

  if (!data || data.length === 0) return staticRules;

  const overrideMap = new Map(data.map((d) => [d.rule_id, d]));

  return staticRules.map((rule) => {
    const override = overrideMap.get(rule.id);
    if (!override) return rule;
    return {
      ...rule,
      description: override.description ?? rule.description,
      items: override.items ?? rule.items,
    };
  });
}

export async function saveRuleOverride(
  methodologyId: string,
  ruleId: string,
  data: { description?: string; items?: string[] }
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase.from("management_rule_overrides").upsert(
    {
      methodology_id: methodologyId,
      rule_id: ruleId,
      ...data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "methodology_id,rule_id" }
  );

  if (error) throw error;
}
