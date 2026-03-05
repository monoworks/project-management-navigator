"use client";

import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { agile } from "@/data/agile";

export default function AgilePage() {
  return (
    <AuthGuard>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/" className="text-sm text-slate-500 hover:text-green-600 transition-colors">
            ← トップに戻る
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 mt-4 mb-2">{agile.name}</h1>
          <p className="text-slate-600">{agile.description}</p>
        </div>

        <Link href="/agile/rules" className="block mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors flex items-center gap-3">
            <svg className="w-6 h-6 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <div>
              <h2 className="font-semibold text-green-800">プロジェクト管理ルール</h2>
              <p className="text-sm text-green-600">スクラムイベント・バックログ・スプリント・品質・コミュニケーション・ツール</p>
            </div>
          </div>
        </Link>

        <div className="space-y-4">
          {agile.phases.map((phase) => (
            <Link
              key={phase.id}
              href={`/agile/${phase.id}`}
              className="block group"
            >
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-green-300 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                    {phase.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-slate-800 group-hover:text-green-600 transition-colors">
                      {phase.name}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 truncate">{phase.description}</p>
                  </div>
                  <div className="text-slate-400 group-hover:text-green-500 transition-colors shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </AuthGuard>
  );
}
