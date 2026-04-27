"use client";

import { BarChart2 } from "lucide-react";
import { GanttSegment } from "@/lib/simulatorApi";

interface GanttChartProps {
  segments: GanttSegment[];
}

// Tailwind-safe colour palette for bars (cycles if N > 10)
const BAR_COLORS = [
  "bg-brand-500",
  "bg-violet-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
];

export default function GanttChart({ segments }: GanttChartProps) {
  if (segments.length === 0) return null;

  const totalTime = segments[segments.length - 1].end;
  const ROW_HEIGHT = 36; // px per customer row

  // Tick marks along the time axis (every ~10% of total, at least 5 ticks)
  const tickInterval = Math.max(1, Math.round(totalTime / 10));
  const ticks: number[] = [];
  for (let t = 0; t <= totalTime; t += tickInterval) ticks.push(t);
  if (ticks[ticks.length - 1] !== totalTime) ticks.push(totalTime);

  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
        <BarChart2 className="w-5 h-5 text-brand-500" />
        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
          Gantt Chart
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          — total time: {totalTime} min
        </span>
      </div>

      <div className="p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[500px]">
          {/* Rows: one per customer */}
          <div className="relative">
            {segments.map((seg, idx) => {
              const leftPct = (seg.start / totalTime) * 100;
              const widthPct = (seg.duration / totalTime) * 100;
              const color = BAR_COLORS[idx % BAR_COLORS.length];

              // Idle gap before this customer (server was free)
              const idleStart =
                idx === 0 ? 0 : segments[idx - 1].end;
              const idleWidth =
                seg.start > idleStart
                  ? ((seg.start - idleStart) / totalTime) * 100
                  : 0;
              const idleLeft = (idleStart / totalTime) * 100;

              return (
                <div
                  key={seg.customerNo}
                  className="flex items-center gap-3 mb-1.5"
                  style={{ height: ROW_HEIGHT }}
                >
                  {/* Label */}
                  <div className="w-8 shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400 text-right">
                    C{seg.customerNo}
                  </div>

                  {/* Track */}
                  <div className="flex-1 relative h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    {/* Idle gap */}
                    {idleWidth > 0 && (
                      <div
                        className="absolute top-0 h-full bg-slate-200 dark:bg-slate-700 rounded-full"
                        style={{
                          left: `${idleLeft}%`,
                          width: `${idleWidth}%`,
                        }}
                        title={`Server idle: ${idleStart}–${seg.start} min`}
                      />
                    )}

                    {/* Service bar */}
                    <div
                      className={`absolute top-0 h-full ${color} rounded-full flex items-center justify-center transition-all duration-500`}
                      style={{
                        left: `${leftPct}%`,
                        width: `${Math.max(widthPct, 0.5)}%`,
                      }}
                      title={`C${seg.customerNo}: ${seg.start}–${seg.end} min (${seg.duration} min service)`}
                    >
                      {widthPct > 5 && (
                        <span className="text-white text-[10px] font-bold px-1 truncate">
                          {seg.duration}m
                        </span>
                      )}
                    </div>
                  </div>

                  {/* End time */}
                  <div className="w-12 shrink-0 text-xs font-mono text-slate-400 dark:text-slate-500">
                    {seg.end}
                  </div>
                </div>
              );
            })}

            {/* Time axis */}
            <div className="flex items-center gap-3 mt-2">
              <div className="w-8 shrink-0" />
              <div className="flex-1 relative h-4">
                {ticks.map((t) => (
                  <div
                    key={t}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${(t / totalTime) * 100}%` }}
                  >
                    <div className="w-px h-1.5 bg-slate-300 dark:bg-slate-600" />
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 -translate-x-1/2">
                      {t}
                    </span>
                  </div>
                ))}
                <div className="absolute bottom-1 left-0 right-0 h-px bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="w-12 shrink-0 text-[9px] font-mono text-slate-400 text-center">
                min
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 pl-11">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700" />
              Server idle
            </div>
            {segments.slice(0, 5).map((seg, idx) => (
              <div
                key={seg.customerNo}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
              >
                <div
                  className={`w-3 h-3 rounded-sm ${BAR_COLORS[idx % BAR_COLORS.length]}`}
                />
                C{seg.customerNo}
              </div>
            ))}
            {segments.length > 5 && (
              <span className="text-xs text-slate-400">…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
