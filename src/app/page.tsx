"use client";

import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";

export default function Home() {
  return (
    <AuthGuard>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            プロジェクトマネジメントナビゲーター
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            システム開発の各工程における進め方、成果物サンプル、注意事項を参照できます。
            プロジェクトの開発手法を選択してください。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/waterfall" className="block group">
            <div className="bg-white rounded-xl shadow-md p-8 border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                ウォーターフォール型
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                各工程を順番に完了させてから次の工程に進む、計画駆動型の開発手法です。
                要件が明確で変更が少ないプロジェクトに適しています。
              </p>
              <div className="mt-4 text-sm text-blue-600 font-medium">
                10工程を確認 →
              </div>
            </div>
          </Link>

          <Link href="/agile" className="block group">
            <div className="bg-white rounded-xl shadow-md p-8 border border-slate-200 hover:shadow-lg hover:border-green-300 transition-all">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-green-600 transition-colors">
                アジャイル型（スクラム）
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                短いイテレーション（スプリント）を繰り返しながら、段階的にプロダクトを開発する手法です。
                変化への柔軟な対応が求められるプロジェクトに適しています。
              </p>
              <div className="mt-4 text-sm text-green-600 font-medium">
                7工程を確認 →
              </div>
            </div>
          </Link>
        </div>
      </main>
    </AuthGuard>
  );
}
