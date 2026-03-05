import { Phase } from "@/types";
import { supabase } from "./supabase";

export async function getPhaseWithOverrides(
  methodologyId: string,
  phaseId: string,
  staticPhase: Phase
): Promise<Phase> {
  if (!supabase) return staticPhase;

  const { data } = await supabase
    .from("phase_overrides")
    .select("description, approach, cautions")
    .eq("methodology_id", methodologyId)
    .eq("phase_id", phaseId)
    .single();

  if (!data) return staticPhase;

  return {
    ...staticPhase,
    description: data.description ?? staticPhase.description,
    approach: data.approach ?? staticPhase.approach,
    cautions: data.cautions ?? staticPhase.cautions,
  };
}

export async function savePhaseOverride(
  methodologyId: string,
  phaseId: string,
  data: { description?: string; approach?: string[]; cautions?: string[] }
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase.from("phase_overrides").upsert(
    {
      methodology_id: methodologyId,
      phase_id: phaseId,
      ...data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "methodology_id,phase_id" }
  );

  if (error) throw error;
}
