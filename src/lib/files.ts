import { UploadedFile } from "@/types";
import { supabase } from "./supabase";

export async function getDeliverableFiles(
  methodologyId: string,
  phaseId: string
): Promise<UploadedFile[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("deliverable_files")
    .select("*")
    .eq("methodology_id", methodologyId)
    .eq("phase_id", phaseId)
    .order("uploaded_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    fileName: row.file_name,
    filePath: row.file_path,
    fileUrl: supabase!.storage.from("deliverables").getPublicUrl(row.file_path)
      .data.publicUrl,
    fileSize: row.file_size,
    uploadedAt: row.uploaded_at,
  }));
}

export async function uploadDeliverableFile(
  methodologyId: string,
  phaseId: string,
  fileName: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<UploadedFile> {
  if (!supabase) throw new Error("Supabase is not configured");

  const uniqueName = `${Date.now()}_${fileName}`;
  const filePath = `${methodologyId}/${phaseId}/${uniqueName}`;

  const { error: uploadError } = await supabase.storage
    .from("deliverables")
    .upload(filePath, fileBuffer, { contentType });

  if (uploadError) throw uploadError;

  const { data, error: dbError } = await supabase
    .from("deliverable_files")
    .insert({
      methodology_id: methodologyId,
      phase_id: phaseId,
      file_name: fileName,
      file_path: filePath,
      file_size: fileBuffer.length,
    })
    .select()
    .single();

  if (dbError) throw dbError;

  const fileUrl = supabase.storage
    .from("deliverables")
    .getPublicUrl(filePath).data.publicUrl;

  return {
    id: data.id,
    fileName: data.file_name,
    filePath: data.file_path,
    fileUrl,
    fileSize: data.file_size,
    uploadedAt: data.uploaded_at,
  };
}

export async function deleteDeliverableFile(
  fileId: string,
  filePath: string
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured");

  const { error: storageError } = await supabase.storage
    .from("deliverables")
    .remove([filePath]);

  if (storageError) throw storageError;

  const { error: dbError } = await supabase
    .from("deliverable_files")
    .delete()
    .eq("id", fileId);

  if (dbError) throw dbError;
}
