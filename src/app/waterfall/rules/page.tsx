"use client";

import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { waterfallRules } from "@/data/management-rules";

export default function WaterfallRulesPage() {
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
          {waterfallRules.map((rule) => (
            <section key={rule.id} className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-2">{rule.category}</h2>
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
            </section>
          ))}
        </div>
      </main>
    </AuthGuard>
  );
}
