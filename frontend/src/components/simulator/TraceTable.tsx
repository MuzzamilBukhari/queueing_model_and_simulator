"use client";

import { ClipboardList } from "lucide-react";
import { CustomerRecord } from "@/lib/simulatorApi";

interface TraceTableProps {
  customers: CustomerRecord[];
}

const th = "px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap text-right";
const thLeft = "px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap text-left";
const td = "px-3 py-2.5 text-right font-mono text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap";
const tdLeft = "px-3 py-2.5 text-left font-semibold text-sm text-brand-600 dark:text-brand-400 whitespace-nowrap";

export default function TraceTable({ customers }: TraceTableProps) {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
        <ClipboardList className="w-5 h-5 text-brand-500" />
        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
          Simulation Trace Table
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          — {customers.length} customers
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/60">
              <th className={thLeft}>S.No</th>
              <th className={th}>Cumulative Prob</th>
              <th className={th}>Cum Prob Lookup</th>
              <th className={th}>No. of Min (k)</th>
              <th className={th}>Inter Arrival</th>
              <th className={th}>Arrival Time</th>
              <th className={th}>Service Time</th>
              <th className={th}>Start Time</th>
              <th className={th}>End Time</th>
              <th className={th}>Turnaround</th>
              <th className={th}>Wait Time</th>
              <th className={th}>Response</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, idx) => (
              <tr
                key={c.no}
                className={
                  idx % 2 === 0
                    ? "bg-white/40 dark:bg-slate-900/20 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors"
                    : "bg-slate-50/40 dark:bg-slate-800/20 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors"
                }
              >
                <td className={tdLeft}>C{c.no}</td>
                <td className={td}>{c.cumulativeProbability.toFixed(5)}</td>
                <td className={td}>{c.cumProbLookup.toFixed(5)}</td>
                <td className={td}>{idx}</td>
                <td className={`${td} font-semibold`}>{c.interArrival}</td>
                <td className={td}>{c.arrivalTime}</td>
                <td className={`${td} text-violet-600 dark:text-violet-400`}>{c.serviceTime}</td>
                <td className={td}>{c.startTime}</td>
                <td className={td}>{c.endTime}</td>
                <td className={`${td} text-amber-600 dark:text-amber-400`}>{c.turnaroundTime}</td>
                <td className={`${td} text-rose-600 dark:text-rose-400`}>{c.waitTime}</td>
                <td className={`${td} text-indigo-600 dark:text-indigo-400`}>{c.responseTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
