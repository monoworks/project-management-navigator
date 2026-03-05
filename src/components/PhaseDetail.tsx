"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Phase, Deliverable, UploadedFile } from "@/types";

function SampleModal({
  title,
  sample,
  onClose,
}: {
  title: string;
  sample: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">{title} - サンプル</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono bg-slate-50 rounded-lg p-4 border border-slate-200">
            {sample}
          </pre>
        </div>
      </div>
    </div>
  );
}

function FileSection({
  files,
  methodologyId,
  phaseId,
  accentColor,
  onFilesChange,
}: {
  files: UploadedFile[];
  methodologyId: string;
  phaseId: string;
  accentColor: "blue" | "green";
  onFilesChange: (files: UploadedFile[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buttonClass =
    accentColor === "blue"
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-green-600 hover:bg-green-700 text-white";

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("methodologyId", methodologyId);
      formData.append("phaseId", phaseId);
      formData.append("file", file);
      const res = await fetch("/api/files", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const uploaded: UploadedFile = await res.json();
      onFilesChange([uploaded, ...files]);
    } catch (err) {
      alert("アップロードに失敗しました");
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

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-semibold text-slate-600">アップロード済みファイル</h4>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`${buttonClass} text-xs px-3 py-1 rounded-md transition-colors disabled:opacity-50`}
        >
          {uploading ? "アップロード中..." : "ファイル追加"}
        </button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
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
              <button onClick={() => handleDelete(file)} className="text-red-400 hover:text-red-600 transition-colors shrink-0" title="削除">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface PhaseDetailProps {
  phase: Phase;
  accentColor: "blue" | "green";
  methodologyId?: string;
}

export default function PhaseDetail({ phase, accentColor, methodologyId }: PhaseDetailProps) {
  const [openSample, setOpenSample] = useState<{ title: string; sample: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(phase.description);
  const [editApproach, setEditApproach] = useState([...phase.approach]);
  const [editCautions, setEditCautions] = useState([...phase.cautions]);
  const [editDeliverables, setEditDeliverables] = useState<Deliverable[]>(
    phase.deliverables.map((d) => ({ ...d }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(phase);
  const [files, setFiles] = useState<UploadedFile[]>(phase.files ?? []);

  useEffect(() => {
    if (!methodologyId) return;
    fetch(`/api/phases/${methodologyId}/${phase.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setCurrentPhase(data);
          setEditDescription(data.description);
          setEditApproach(data.approach);
          setEditCautions(data.cautions);
          setEditDeliverables(data.deliverables.map((d: Deliverable) => ({ ...d })));
          setFiles(data.files ?? []);
        }
      })
      .catch(() => {});
  }, [methodologyId, phase.id]);

  const startEditing = useCallback(() => {
    setEditDescription(currentPhase.description);
    setEditApproach([...currentPhase.approach]);
    setEditCautions([...currentPhase.cautions]);
    setEditDeliverables(currentPhase.deliverables.map((d) => ({ ...d })));
    setIsEditing(true);
  }, [currentPhase]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  async function handleSave() {
    if (!methodologyId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/phases/${methodologyId}/${phase.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: editDescription,
          approach: editApproach,
          cautions: editCautions,
          deliverables: editDeliverables,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setCurrentPhase({
        ...currentPhase,
        description: editDescription,
        approach: editApproach,
        cautions: editCautions,
        deliverables: editDeliverables,
      });
      setIsEditing(false);
    } catch (err) {
      alert("保存に失敗しました");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  const colors = {
    blue: {
      bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700",
      badge: "bg-blue-100 text-blue-700", number: "bg-blue-600 text-white",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    green: {
      bg: "bg-green-50", border: "border-green-200", text: "text-green-700",
      badge: "bg-green-100 text-green-700", number: "bg-green-600 text-white",
      button: "bg-green-600 hover:bg-green-700 text-white",
    },
  };

  const c = colors[accentColor];
  const displayPhase = currentPhase;

  return (
    <>
      {openSample && (
        <SampleModal title={openSample.title} sample={openSample.sample} onClose={() => setOpenSample(null)} />
      )}

      <div className="space-y-8">
        {/* Header */}
        <div className={`${c.bg} ${c.border} border rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className={`${c.number} w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold`}>
                {displayPhase.order}
              </span>
              <h1 className="text-2xl font-bold text-slate-800">{displayPhase.name}</h1>
            </div>
            {methodologyId && !isEditing && (
              <button
                onClick={startEditing}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-white/50"
                title="編集"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
          {isEditing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full mt-2 p-3 rounded-lg border border-slate-300 text-slate-700 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          ) : (
            <p className="text-slate-600 mt-2">{displayPhase.description}</p>
          )}
        </div>

        {/* Approach */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className={`w-5 h-5 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            進め方
          </h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {(isEditing ? editApproach : displayPhase.approach).map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <span className={`${c.badge} w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5`}>
                  {i + 1}
                </span>
                {isEditing ? (
                  <div className="flex-1 flex gap-2">
                    <textarea
                      value={step}
                      onChange={(e) => { const u = [...editApproach]; u[i] = e.target.value; setEditApproach(u); }}
                      className="flex-1 p-2 rounded border border-slate-300 text-sm text-slate-700 resize-y min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <button onClick={() => setEditApproach(editApproach.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 shrink-0 mt-1" title="削除">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-700">{step}</p>
                )}
              </div>
            ))}
            {isEditing && (
              <div className="p-4">
                <button onClick={() => setEditApproach([...editApproach, ""])} className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                  + ステップを追加
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Deliverables */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className={`w-5 h-5 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            成果物
          </h2>
          <div className="grid gap-4">
            {(isEditing ? editDeliverables : displayPhase.deliverables).map((deliverable, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-5">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        value={deliverable.name}
                        onChange={(e) => {
                          const u = [...editDeliverables];
                          u[i] = { ...u[i], name: e.target.value };
                          setEditDeliverables(u);
                        }}
                        placeholder="成果物名"
                        className="flex-1 p-2 rounded border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      <button
                        onClick={() => setEditDeliverables(editDeliverables.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600 shrink-0"
                        title="成果物を削除"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <textarea
                      value={deliverable.description}
                      onChange={(e) => {
                        const u = [...editDeliverables];
                        u[i] = { ...u[i], description: e.target.value };
                        setEditDeliverables(u);
                      }}
                      placeholder="説明"
                      className="w-full p-2 rounded border border-slate-300 text-sm text-slate-600 resize-y min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <textarea
                      value={deliverable.sample ?? ""}
                      onChange={(e) => {
                        const u = [...editDeliverables];
                        u[i] = { ...u[i], sample: e.target.value || undefined };
                        setEditDeliverables(u);
                      }}
                      placeholder="サンプル（任意）"
                      className="w-full p-2 rounded border border-slate-300 text-sm text-slate-600 font-mono resize-y min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-slate-800 mb-1">{deliverable.name}</h3>
                    <p className="text-sm text-slate-600 mb-3">{deliverable.description}</p>
                    {deliverable.sample && (
                      <button
                        onClick={() => setOpenSample({ title: deliverable.name, sample: deliverable.sample! })}
                        className={`${c.button} text-sm px-4 py-2 rounded-lg transition-colors`}
                      >
                        サンプルを表示
                      </button>
                    )}
                  </>
                )}
                {methodologyId && !isEditing && (
                  <FileSection
                    files={files}
                    methodologyId={methodologyId}
                    phaseId={phase.id}
                    accentColor={accentColor}
                    onFilesChange={setFiles}
                  />
                )}
              </div>
            ))}
            {isEditing && (
              <button
                onClick={() =>
                  setEditDeliverables([...editDeliverables, { name: "", description: "" }])
                }
                className={`border-2 border-dashed border-slate-300 rounded-lg p-4 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors`}
              >
                + 成果物を追加
              </button>
            )}
          </div>
        </section>

        {/* Cautions */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            注意事項
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <ul className="space-y-3">
              {(isEditing ? editCautions : displayPhase.cautions).map((caution, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <span className="text-amber-500 mt-1 shrink-0">&#9679;</span>
                  {isEditing ? (
                    <div className="flex-1 flex gap-2">
                      <textarea
                        value={caution}
                        onChange={(e) => { const u = [...editCautions]; u[i] = e.target.value; setEditCautions(u); }}
                        className="flex-1 p-2 rounded border border-slate-300 text-sm resize-y min-h-[40px] focus:outline-none focus:ring-2 focus:ring-amber-300"
                      />
                      <button onClick={() => setEditCautions(editCautions.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 shrink-0 mt-1" title="削除">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <span>{caution}</span>
                  )}
                </li>
              ))}
            </ul>
            {isEditing && (
              <button onClick={() => setEditCautions([...editCautions, ""])} className="text-sm text-amber-600 hover:text-amber-800 transition-colors mt-3">
                + 注意事項を追加
              </button>
            )}
          </div>
        </section>

        {/* Edit action bar */}
        {isEditing && (
          <div className="sticky bottom-4 bg-white border border-slate-200 rounded-xl shadow-lg p-4 flex items-center justify-end gap-3">
            <button onClick={cancelEditing} disabled={isSaving} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50">
              キャンセル
            </button>
            <button onClick={handleSave} disabled={isSaving} className={`${c.button} px-6 py-2 text-sm rounded-lg transition-colors disabled:opacity-50`}>
              {isSaving ? "保存中..." : "保存"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
