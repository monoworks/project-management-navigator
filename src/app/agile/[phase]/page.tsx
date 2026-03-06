"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import PhaseDetail from "@/components/PhaseDetail";
import MethodologySidebar from "@/components/MethodologySidebar";
import { useAuth } from "@/components/AuthProvider";
import { agile } from "@/data/agile";

export default function AgilePhasePage({ params }: { params: Promise<{ phase: string }> }) {
  const { phase: phaseId } = use(params);
  const { role } = useAuth();
  const phase = agile.phases.find((p) => p.id === phaseId);

  if (!phase) {
    notFound();
  }

  return (
    <AuthGuard>
      <Header />
      <div className="flex h-[calc(100vh-65px)]">
        <MethodologySidebar
          methodologyName={agile.name}
          methodologyPath="agile"
          phases={agile.phases}
          currentPhaseId={phaseId}
          accentColor="green"
        />
        <main className="flex-1 overflow-y-auto px-6 lg:px-10 py-8">
          <div className="max-w-4xl">
            <PhaseDetail phase={phase} accentColor="green" methodologyId="agile" canEdit={role === "editor"} />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
