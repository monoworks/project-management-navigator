"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { agile } from "@/data/agile";

export default function AgilePage() {
  const router = useRouter();
  const firstPhaseId = agile.phases[0]?.id;

  useEffect(() => {
    if (firstPhaseId) {
      router.replace(`/agile/${firstPhaseId}`);
    }
  }, [router, firstPhaseId]);

  return (
    <AuthGuard>
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-400 text-sm">読み込み中...</div>
      </div>
    </AuthGuard>
  );
}
