"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import { waterfallRules } from "@/data/management-rules";
import { ManagementRule, UploadedFile } from "@/types";

function RuleFileSection({
  files,
  methodologyId,
  ruleId,
  canEdit,
  onFilesChange,
}: {
  files: UploadedFile[];
  methodologyId: string;
  ruleId: string;
  canEdit: boolean;
  onFilesChange: (files: UploadedFile[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("methodologyId", methodologyId);
      formData.append("phaseId", `rule-${ruleId}`);
      formData.append("file", file);
      const res = await fetch("/api/files", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onFilesChange([data, ...files]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      alert(`アップロードに失敗しました: ${msg}`);
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(file: UploadedFile) {
    if (!confirm(`「${file.fileName}」を削除しますか？`)) return;
    try {
      const res = await fetch(`/api/files/${file.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: file.filePath }),
      });
      if (!res.ok) throw new Error("Delete failed");
      onFilesChange(files.filter((f) => f.id !== file.id));
    } catch (err) {
      alert("削除に失敗しました");
      console.error(err);
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          成果物サンプル
        </h4>
        {canEdit && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md transition-colors disabled:opacity-50"
            >
              {uploading ? "アップロード中..." : "ファイル追加"}
            </button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
          </>
        )}
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 bg-slate-50 rounded-md px-3 py-2 text-sm">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate flex-1">
                {file.fileName}
              </a>
              <span className="text-slate-400 text-xs shrink-0">{formatFileSize(file.fileSize)}</span>
              {canEdit && (
                <button onClick={() => handleDelete(file)} className="text-red-400 hover:text-red-600 transition-colors shrink-0" title="削除">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {files.length === 0 && (
        <p className="text-xs text-slate-400">アップロードされたファイルはありません</p>
      )}
    </div>
  );
}

export default function WaterfallRulesPage() {
  const { role } = useAuth();
  const canEdit = role === "editor";
  const [rules, setRules] = useState<ManagementRule[]>(waterfallRules);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editItems, setEditItems] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [ruleFiles, setRuleFiles] = useState<Record<string, UploadedFile[]>>({});

  useEffect(() => {
    fetch("/api/rules/waterfall")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setRules(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Fetch files for all rules in parallel
    const ruleIds = waterfallRules.map((r) => r.id);
    Promise.all(
      ruleIds.map((id) =>
        fetch(`/api/files?methodologyId=waterfall&phaseId=rule-${id}`)
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => [])
      )
    ).then((results) => {
      const filesMap: Record<string, UploadedFile[]> = {};
      ruleIds.forEach((id, i) => {
        filesMap[id] = results[i];
      });
      setRuleFiles(filesMap);
    });
  }, []);

  const startEditing = useCallback((rule: ManagementRule) => {
    setEditingId(rule.id);
    setEditDescription(rule.description);
    setEditItems([...rule.items]);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
  }, []);

  async function handleSave(ruleId: string) {
    setIsSaving(true);
    try {
      const res = await fetch("/api/rules/waterfall", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId, description: editDescription, items: editItems }),
      });
      if (!res.ok) throw new Error("Save failed");
      setRules(rules.map((r) =>
        r.id === ruleId ? { ...r, description: editDescription, items: editItems } : r
      ));
      setEditingId(null);
    } catch (err) {
      alert("保存に失敗しました");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  function updateRuleFiles(ruleId: string, files: UploadedFile[]) {
    setRuleFiles((prev) => ({ ...prev, [ruleId]: files }));
  }

  return (
    <AuthGuard>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/waterfall" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
            ← ウォーターフォール一覧に戻る
          </Link>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            プロジェクト管理ルール
          </h1>
          <p className="text-slate-600 mt-2">
            ウォーターフォール型開発におけるプロジェクト管理の基本ルールです。プロジェクトの特性に応じてカスタマイズしてください。
          </p>
        </div>

        <div className="space-y-6">
          {rules.map((rule) => {
            const isEditing = editingId === rule.id;
            return (
              <section key={rule.id} className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-slate-800">{rule.category}</h2>
                  {canEdit && !isEditing && (
                    <button
                      onClick={() => startEditing(rule)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
                      title="編集"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full p-2 rounded border border-slate-300 text-sm text-slate-600 resize-y min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <ul className="space-y-2">
                      {editItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-2.5 shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <textarea
                            value={item}
                            onChange={(e) => {
                              const u = [...editItems];
                              u[i] = e.target.value;
                              setEditItems(u);
                            }}
                            className="flex-1 p-2 rounded border border-slate-300 text-sm text-slate-700 resize-y min-h-[36px] focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                          <button
                            onClick={() => setEditItems(editItems.filter((_, j) => j !== i))}
                            className="text-red-400 hover:text-red-600 shrink-0 mt-2"
                            title="削除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setEditItems([...editItems, ""])}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      + ルール項目を追加
                    </button>
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                      <button
                        onClick={cancelEditing}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={() => handleSave(rule.id)}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isSaving ? "保存中..." : "保存"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-slate-500 mb-4">{rule.description}</p>
                    <ul className="space-y-2">
                      {rule.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-blue-500 mt-0.5 shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <RuleFileSection
                  files={ruleFiles[rule.id] ?? []}
                  methodologyId="waterfall"
                  ruleId={rule.id}
                  canEdit={canEdit}
                  onFilesChange={(files) => updateRuleFiles(rule.id, files)}
                />
              </section>
            );
          })}
        </div>
      </main>
    </AuthGuard>
  );
}
