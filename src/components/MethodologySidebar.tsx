"use client";

import Link from "next/link";
import { Phase } from "@/types";

interface MethodologySidebarProps {
  methodologyName: string;
  methodologyPath: string;
  phases: Phase[];
  currentPhaseId: string;
  accentColor: "blue" | "green";
}

export default function MethodologySidebar({
  methodologyName,
  methodologyPath,
  phases,
  currentPhaseId,
  accentColor,
}: MethodologySidebarProps) {
  const colors = {
    blue: {
      activeBg: "bg-blue-50",
      activeBorder: "border-blue-600",
      activeText: "text-blue-700",
      hoverBg: "hover:bg-slate-50",
      badge: "bg-blue-100 text-blue-700",
      activeBadge: "bg-blue-600 text-white",
      rulesHover: "hover:bg-blue-50",
      rulesIcon: "text-blue-600",
    },
    green: {
      activeBg: "bg-green-50",
      activeBorder: "border-green-600",
      activeText: "text-green-700",
      hoverBg: "hover:bg-slate-50",
      badge: "bg-green-100 text-green-700",
      activeBadge: "bg-green-600 text-white",
      rulesHover: "hover:bg-green-50",
      rulesIcon: "text-green-600",
    },
  };

  const c = colors[accentColor];

  return (
    <nav className="w-72 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
      <div className="p-4 border-b border-slate-200">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← トップに戻る
        </Link>
        <h2 className="text-sm font-bold text-slate-800 mt-2">{methodologyName}</h2>
      </div>

      <div className="p-2">
        <Link
          href={`/${methodologyPath}/rules`}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 ${c.rulesHover} transition-colors mb-1`}
        >
          <svg className={`w-4 h-4 ${c.rulesIcon} shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          管理ルール
        </Link>

        <div className="space-y-0.5">
          {phases.map((phase) => {
            const isActive = phase.id === currentPhaseId;
            return (
              <Link
                key={phase.id}
                href={`/${methodologyPath}/${phase.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? `${c.activeBg} border-l-3 ${c.activeBorder} ${c.activeText} font-semibold`
                    : `text-slate-600 ${c.hoverBg}`
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isActive ? c.activeBadge : c.badge
                  }`}
                >
                  {phase.order}
                </span>
                <span className="truncate">{phase.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
