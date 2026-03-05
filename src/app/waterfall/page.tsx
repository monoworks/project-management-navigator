"use client";

import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { waterfall } from "@/data/waterfall";

export default function WaterfallPage() {
  return (
    <AuthGuard>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
            ← トップに戻る
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 mt-4 mb-2">{waterfall.name}</h1>
          <p className="text-slate-600">{waterfall.description}</p>
        </div>

        <div className="space-y-4">
          {waterfall.phases.map((phase) => (
            <Link
              key={phase.id}
              href={`/waterfall/${phase.id}`}
              className="block group"
            >
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                    {phase.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {phase.name}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 truncate">{phase.description}</p>
                  </div>
                  <div className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0">
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
