"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import PhaseDetail from "@/components/PhaseDetail";
import MethodologySidebar from "@/components/MethodologySidebar";
import { waterfall } from "@/data/waterfall";

export default function WaterfallPhasePage({ params }: { params: Promise<{ phase: string }> }) {
  const { phase: phaseId } = use(params);
  const phase = waterfall.phases.find((p) => p.id === phaseId);

  if (!phase) {
    notFound();
  }

  return (
    <AuthGuard>
      <Header />
      <div className="flex h-[calc(100vh-65px)]">
        <MethodologySidebar
          methodologyName={waterfall.name}
          methodologyPath="waterfall"
          phases={waterfall.phases}
          currentPhaseId={phaseId}
          accentColor="blue"
        />
        <main className="flex-1 overflow-y-auto px-6 lg:px-10 py-8">
          <div className="max-w-4xl">
            <PhaseDetail phase={phase} accentColor="blue" methodologyId="waterfall" />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
