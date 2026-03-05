"use client";

import { useState } from "react";
import { Phase } from "@/types";

function SampleModal({ title, sample, onClose }: { title: string; sample: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">{title} - サンプル</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono bg-slate-50 rounded-lg p-4 border border-slate-200">
            {sample}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function PhaseDetail({ phase, accentColor }: { phase: Phase; accentColor: "blue" | "green" }) {
  const [openSample, setOpenSample] = useState<{ title: string; sample: string } | null>(null);

  const colors = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-700",
      number: "bg-blue-600 text-white",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      badge: "bg-green-100 text-green-700",
      number: "bg-green-600 text-white",
      button: "bg-green-600 hover:bg-green-700 text-white",
    },
  };

  const c = colors[accentColor];

  return (
    <>
      {openSample && (
        <SampleModal
          title={openSample.title}
          sample={openSample.sample}
          onClose={() => setOpenSample(null)}
        />
      )}

      <div className="space-y-8">
        {/* Header */}
        <div className={`${c.bg} ${c.border} border rounded-xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`${c.number} w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold`}>
              {phase.order}
            </span>
            <h1 className="text-2xl font-bold text-slate-800">{phase.name}</h1>
          </div>
          <p className="text-slate-600 mt-2">{phase.description}</p>
        </div>

        {/* Approach */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className={`w-5 h-5 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            進め方
          </h2>
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {phase.approach.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <span className={`${c.badge} w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5`}>
                  {i + 1}
                </span>
                <p className="text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Deliverables */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className={`w-5 h-5 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            成果物
          </h2>
          <div className="grid gap-4">
            {phase.deliverables.map((deliverable, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 mb-1">{deliverable.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{deliverable.description}</p>
                {deliverable.sample && (
                  <button
                    onClick={() => setOpenSample({ title: deliverable.name, sample: deliverable.sample! })}
                    className={`${c.button} text-sm px-4 py-2 rounded-lg transition-colors`}
                  >
                    サンプルを表示
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Cautions */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className={`w-5 h-5 text-amber-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            注意事項
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
            <ul className="space-y-3">
              {phase.cautions.map((caution, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700">
                  <span className="text-amber-500 mt-1 shrink-0">&#9679;</span>
                  <span>{caution}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
