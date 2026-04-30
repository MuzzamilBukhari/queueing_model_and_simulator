"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Table2 } from "lucide-react";
import { CdfRow } from "@/lib/simulatorApi";

interface CdfTableProps {
  rows: CdfRow[];
  lambda: number;
}

export default function CdfTable({ rows, lambda }: CdfTableProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Table2 className="w-5 h-5 text-brand-500" />
          <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
            Poisson CDF Lookup Table (λ = {lambda})
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            — {rows.length} rows
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="overflow-x-auto border-t border-slate-200/60 dark:border-slate-700/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60">
                <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  k (min)
                </th>
                <th className="px-4 py-3 text-right font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  P(X = k)
                </th>
                <th className="px-4 py-3 text-right font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cumulative Probability
                </th>
                <th className="px-4 py-3 text-right font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cum Prob Lookup
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.k}
                  className={
                    idx % 2 === 0
                      ? "bg-white/40 dark:bg-slate-900/20"
                      : "bg-slate-50/40 dark:bg-slate-800/20"
                  }
                >
                  <td className="px-4 py-2.5 font-semibold text-brand-600 dark:text-brand-400">
                    {row.k}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300 font-mono">
                    {row.pmf.toFixed(5)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300 font-mono">
                    {row.cumulativeProbability.toFixed(5)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300 font-mono">
                    {row.cumProbLookup.toFixed(5)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
