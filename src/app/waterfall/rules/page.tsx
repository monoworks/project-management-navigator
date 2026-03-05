"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { waterfallRules } from "@/data/management-rules";
import { ManagementRule } from "@/types";

export default function WaterfallRulesPage() {
  const [rules, setRules] = useState<ManagementRule[]>(waterfallRules);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editItems, setEditItems] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/rules/waterfall")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setRules(data);
      })
      .catch(() => {});
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
                  {!isEditing && (
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
              </section>
            );
          })}
        </div>
      </main>
    </AuthGuard>
  );
}
