import { ManagementRule } from "@/types";
import { supabase } from "./supabase";

export async function getRulesWithOverrides(
  methodologyId: string,
  staticRules: ManagementRule[]
): Promise<ManagementRule[]> {
  if (!supabase) return staticRules;

  const [overridesResult, customResult, deletedResult] = await Promise.all([
    supabase
      .from("management_rule_overrides")
      .select("rule_id, description, items")
      .eq("methodology_id", methodologyId),
    supabase
      .from("custom_management_rules")
      .select("rule_id, category, description, items")
      .eq("methodology_id", methodologyId),
    supabase
      .from("deleted_management_rules")
      .select("rule_id")
      .eq("methodology_id", methodologyId),
  ]);

  const deletedIds = new Set(
    (deletedResult.data ?? []).map((d) => d.rule_id)
  );

  const overrideMap = new Map(
    (overridesResult.data ?? []).map((d) => [d.rule_id, d])
  );

  const mergedStatic = staticRules
    .filter((rule) => !deletedIds.has(rule.id))
    .map((rule) => {
      const override = overrideMap.get(rule.id);
      if (!override) return rule;
      return {
        ...rule,
        description: override.description ?? rule.description,
        items: override.items ?? rule.items,
      };
    });

  const customRules: ManagementRule[] = (customResult.data ?? [])
    .filter((d) => !deletedIds.has(d.rule_id))
    .map((d) => ({
      id: d.rule_id,
      category: d.category,
      description: d.description ?? "",
      items: d.items ?? [],
    }));

  return [...mergedStatic, ...customRules];
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

export async function addCustomRule(
  methodologyId: string,
  rule: { id: string; category: string; description: string; items: string[] }
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase.from("custom_management_rules").insert({
    methodology_id: methodologyId,
    rule_id: rule.id,
    category: rule.category,
    description: rule.description,
    items: rule.items,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function deleteRule(
  methodologyId: string,
  ruleId: string
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");

  // Try deleting from custom rules first
  const { data } = await supabase
    .from("custom_management_rules")
    .delete()
    .eq("methodology_id", methodologyId)
    .eq("rule_id", ruleId)
    .select();

  if (data && data.length > 0) return;

  // If it's a static rule, mark as deleted
  const { error } = await supabase.from("deleted_management_rules").upsert(
    {
      methodology_id: methodologyId,
      rule_id: ruleId,
      deleted_at: new Date().toISOString(),
    },
    { onConflict: "methodology_id,rule_id" }
  );

  if (error) throw error;
}
