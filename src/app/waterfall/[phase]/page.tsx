"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import PhaseDetail from "@/components/PhaseDetail";
import { waterfall } from "@/data/waterfall";

export default function WaterfallPhasePage({ params }: { params: Promise<{ phase: string }> }) {
  const { phase: phaseId } = use(params);
  const phase = waterfall.phases.find((p) => p.id === phaseId);

  if (!phase) {
    notFound();
  }

  const currentIndex = waterfall.phases.findIndex((p) => p.id === phaseId);
  const prevPhase = currentIndex > 0 ? waterfall.phases[currentIndex - 1] : null;
  const nextPhase = currentIndex < waterfall.phases.length - 1 ? waterfall.phases[currentIndex + 1] : null;

  return (
    <AuthGuard>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/waterfall" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
            ← ウォーターフォール一覧に戻る
          </Link>
        </div>

        <PhaseDetail phase={phase} accentColor="blue" methodologyId="waterfall" />

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-6 border-t border-slate-200">
          {prevPhase ? (
            <Link
              href={`/waterfall/${prevPhase.id}`}
              className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              ← {prevPhase.name}
            </Link>
          ) : (
            <div />
          )}
          {nextPhase ? (
            <Link
              href={`/waterfall/${nextPhase.id}`}
              className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              {nextPhase.name} →
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
