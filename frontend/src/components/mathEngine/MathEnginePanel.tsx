"use client";

import { useState, FormEvent } from "react";
import { computeQueue, QueueModel, QueueResults } from "@/lib/queueMath";

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number, d = 6): string {
  if (!isFinite(n)) return "—";
  return n.toFixed(d);
}
function fmtPct(n: number, d = 4): string {
  if (!isFinite(n)) return "—";
  return (n * 100).toFixed(d) + "%";
}

// ─── shared sub-components ────────────────────────────────────────────────────

function Toggle({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex border-2 border-zinc-700">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest transition-colors duration-100
            ${value === o.value
              ? "bg-amber-400 text-black"
              : "bg-black text-zinc-500 hover:text-white hover:bg-zinc-900"
            }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({
  id,
  label,
  notation,
  value,
  onChange,
  placeholder,
  min = "0.0001",
  step = "any",
}: {
  id: string;
  label: string;
  notation: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  min?: string;
  step?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline gap-2 mb-1.5">
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
          {label}
        </span>
        <span className="font-mono text-amber-400 text-[11px]">{notation}</span>
      </label>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black border-2 border-zinc-700 text-white font-mono text-sm
          px-3 py-2.5 rounded-none focus:outline-none focus:border-amber-400
          placeholder:text-zinc-700 transition-colors duration-100"
      />
    </div>
  );
}

function Metric({
  label,
  formula,
  value,
  hi = false,
}: {
  label: string;
  formula?: string;
  value: string;
  hi?: boolean;
}) {
  return (
    <div className={`border-2 p-4 flex flex-col gap-1 ${hi ? "border-amber-400 bg-amber-400/5" : "border-zinc-800 bg-zinc-950"}`}>
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
      {formula && <span className="font-mono text-[10px] text-zinc-600">{formula}</span>}
      <span className={`font-mono text-2xl font-black mt-1 break-all ${hi ? "text-amber-400" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-7 mb-3">
      <div className="w-1 h-5 bg-amber-400 shrink-0" />
      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}

// ─── constants ────────────────────────────────────────────────────────────────

const MODELS: { value: QueueModel; label: string }[] = [
  { value: "M/M/S", label: "M/M/S — Markovian arrivals & service" },
  { value: "M/G/S", label: "M/G/S — Markovian arrivals, General service" },
  { value: "G/G/S", label: "G/G/S — General arrivals & service" },
];

const ARRIVAL_OPTS = [
  { value: "rate", label: "Rate (λ)" },
  { value: "time", label: "Mean Time (1/λ)" },
];

const SERVICE_OPTS = [
  { value: "rate", label: "Rate (μ)" },
  { value: "time", label: "Mean Time (1/μ)" },
];

// ─── main ─────────────────────────────────────────────────────────────────────

export default function MathEnginePanel() {
  // model
  const [model, setModel] = useState<QueueModel>("M/M/S");

  // arrival
  const [arrivalMode, setArrivalMode] = useState<"rate" | "time">("rate");
  const [arrivalVal, setArrivalVal] = useState("");
  const [sigmaArrival, setSigmaArrival] = useState("");

  // service
  const [serviceMode, setServiceMode] = useState<"rate" | "time">("time");
  const [serviceVal, setServiceVal] = useState("");
  const [sigmaService, setSigmaService] = useState("");

  // servers / Pn
  const [servers, setServers] = useState("1");
  const [nInput, setNInput] = useState("0");

  // output
  const [results, setResults] = useState<QueueResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const needsSigmaService = model !== "M/M/S";
  const needsSigmaArrival = model === "G/G/S";
  const isGG = model !== "M/M/S";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);

    const raw = parseFloat(arrivalVal);
    const svcRaw = parseFloat(serviceVal);
    const S = parseInt(servers, 10);

    if (!raw || raw <= 0)
      return setError(
        arrivalMode === "rate"
          ? "Arrival rate λ must be > 0."
          : "Mean inter-arrival time must be > 0."
      );
    if (!svcRaw || svcRaw <= 0)
      return setError(
        serviceMode === "rate"
          ? "Service rate μ must be > 0."
          : "Mean service time must be > 0."
      );
    if (!S || S < 1) return setError("Number of servers must be ≥ 1.");

    // Convert to inter-arrival time (1/λ) and service time (1/μ)
    const ia = arrivalMode === "rate" ? 1 / raw : raw;
    const st = serviceMode === "rate" ? 1 / svcRaw : svcRaw;

    // σ_a: exponential arrivals (M/M/S, M/G/S) → σ_a = 1/λ = ia
    const sa = needsSigmaArrival ? parseFloat(sigmaArrival) : ia;
    // σ_s: exponential service (M/M/S) → σ_s = 1/μ = st
    const ss = needsSigmaService ? parseFloat(sigmaService) : st;

    if (needsSigmaArrival && (isNaN(sa) || sa < 0))
      return setError("Std dev of arrival time (σ_a) must be ≥ 0.");
    if (needsSigmaService && (isNaN(ss) || ss < 0))
      return setError("Std dev of service time (σ_s) must be ≥ 0.");

    const res = computeQueue({
      interArrivalTime: ia,
      sigmaArrival: sa,
      serviceTime: st,
      sigmaService: ss,
      servers: S,
      model,
    });

    if (!res.isStable) {
      setError(
        `UNSTABLE — ρ = ${(res.P * 100).toFixed(2)}% ≥ 100%. ` +
          `Need at least ${Math.ceil(res.P * S)} servers for stability.`
      );
    }
    setResults(res);
  };

  const S = parseInt(servers, 10) || 1;
  const n = parseInt(nInput, 10);
  const pnResult = results && results.isStable ? results.Pn(n) : null;

  // derived display values for the "what you entered" row
  const derivedLambda =
    arrivalVal
      ? arrivalMode === "rate"
        ? parseFloat(arrivalVal)
        : 1 / parseFloat(arrivalVal)
      : null;
  const derivedMu =
    serviceVal
      ? serviceMode === "rate"
        ? parseFloat(serviceVal)
        : 1 / parseFloat(serviceVal)
      : null;

  return (
    <div className="bg-black text-white min-h-screen">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="border-b-4 border-amber-400 px-6 py-5 flex items-end gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-400 mb-0.5">
            Queueing Theory
          </p>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none">
            MATH ENGINE
          </h1>
        </div>
        <div className="hidden sm:flex flex-1 items-end pb-0.5">
          <div className="flex-1 h-px bg-zinc-800" />
          <p className="ml-4 font-mono text-[10px] text-zinc-600">
            M/M/S · M/G/S · G/G/S
          </p>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr]">

        {/* ── INPUT PANEL ─────────────────────────────────────────────── */}
        <aside className="border-b-2 xl:border-b-0 xl:border-r-2 border-zinc-800">
          <div className="px-5 py-3 border-b-2 border-zinc-800 bg-zinc-950">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Input Parameters
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-6">

            {/* Model selector */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">
                Queue Model
              </p>
              <select
                value={model}
                onChange={(e) => {
                  setModel(e.target.value as QueueModel);
                  setResults(null);
                  setError(null);
                }}
                className="w-full bg-black border-2 border-zinc-700 text-white font-mono text-sm
                  px-3 py-2.5 rounded-none focus:outline-none focus:border-amber-400
                  transition-colors duration-100 cursor-pointer"
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* ── ARRIVAL ── */}
            <div className="border-l-2 border-zinc-700 pl-4 flex flex-col gap-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Arrival Input
              </p>

              {/* toggle */}
              <Toggle
                options={ARRIVAL_OPTS}
                value={arrivalMode}
                onChange={(v) => {
                  setArrivalMode(v as "rate" | "time");
                  setArrivalVal("");
                }}
              />

              {/* value field */}
              {arrivalMode === "rate" ? (
                <Field
                  id="arr-rate"
                  label="Arrival Rate"
                  notation="λ  (customers / unit time)"
                  value={arrivalVal}
                  onChange={setArrivalVal}
                  placeholder="e.g. 5"
                />
              ) : (
                <Field
                  id="arr-time"
                  label="Mean Inter-Arrival Time"
                  notation="1/λ  (time / customer)"
                  value={arrivalVal}
                  onChange={setArrivalVal}
                  placeholder="e.g. 0.2"
                />
              )}

              {/* derived preview */}
              {derivedLambda !== null && isFinite(derivedLambda) && derivedLambda > 0 && (
                <div className="flex gap-4 font-mono text-[11px] text-zinc-600 border border-zinc-800 bg-zinc-950 px-3 py-2">
                  <span>λ = <span className="text-zinc-400">{derivedLambda.toFixed(6)}</span></span>
                  <span>1/λ = <span className="text-zinc-400">{(1 / derivedLambda).toFixed(6)}</span></span>
                </div>
              )}

              {/* G/G/S needs σ_a */}
              {needsSigmaArrival ? (
                <Field
                  id="sigma-a"
                  label="Std Dev of Inter-Arrival Time"
                  notation="σ_a"
                  value={sigmaArrival}
                  onChange={setSigmaArrival}
                  placeholder="e.g. 0.15"
                  min="0"
                />
              ) : (
                <p className="font-mono text-[11px] text-zinc-600 border border-zinc-800 bg-zinc-950 px-3 py-2">
                  Ca² = 1 (exponential inter-arrivals, σ_a = 1/λ is fixed)
                </p>
              )}
            </div>

            {/* ── SERVICE ── */}
            <div className="border-l-2 border-zinc-700 pl-4 flex flex-col gap-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Service Input
              </p>

              {/* toggle */}
              <Toggle
                options={SERVICE_OPTS}
                value={serviceMode}
                onChange={(v) => {
                  setServiceMode(v as "rate" | "time");
                  setServiceVal("");
                }}
              />

              {/* value field */}
              {serviceMode === "rate" ? (
                <Field
                  id="svc-rate"
                  label="Service Rate"
                  notation="μ  (customers / unit time)"
                  value={serviceVal}
                  onChange={setServiceVal}
                  placeholder="e.g. 8"
                />
              ) : (
                <Field
                  id="svc-time"
                  label="Mean Service Time"
                  notation="1/μ  (time / customer)"
                  value={serviceVal}
                  onChange={setServiceVal}
                  placeholder="e.g. 0.125"
                />
              )}

              {/* derived preview */}
              {derivedMu !== null && isFinite(derivedMu) && derivedMu > 0 && (
                <div className="flex gap-4 font-mono text-[11px] text-zinc-600 border border-zinc-800 bg-zinc-950 px-3 py-2">
                  <span>μ = <span className="text-zinc-400">{derivedMu.toFixed(6)}</span></span>
                  <span>1/μ = <span className="text-zinc-400">{(1 / derivedMu).toFixed(6)}</span></span>
                </div>
              )}

              {/* M/G/S and G/G/S need σ_s */}
              {needsSigmaService ? (
                <Field
                  id="sigma-s"
                  label="Std Dev of Service Time"
                  notation="σ_s"
                  value={sigmaService}
                  onChange={setSigmaService}
                  placeholder="e.g. 0.1"
                  min="0"
                />
              ) : (
                <p className="font-mono text-[11px] text-zinc-600 border border-zinc-800 bg-zinc-950 px-3 py-2">
                  Cs² = 1 (exponential service, σ_s = 1/μ is fixed)
                </p>
              )}
            </div>

            {/* ── SERVERS ── */}
            <Field
              id="servers"
              label="Number of Servers"
              notation="S"
              value={servers}
              onChange={setServers}
              placeholder="e.g. 3"
              min="1"
              step="1"
            />

            {/* Wq note */}
            {isGG && (
              <div className="border border-zinc-800 bg-zinc-950 px-3 py-2">
                <p className="font-mono text-[11px] text-zinc-600 leading-relaxed">
                  Wq = (Ca² + Cs²)/2 × Wq_mms &nbsp;·&nbsp; Lq_eff = λ × Wq
                </p>
              </div>
            )}

            <button
              type="submit"
              className="bg-amber-400 text-black font-black uppercase tracking-widest text-sm
                px-6 py-3.5 rounded-none border-2 border-amber-400
                hover:bg-black hover:text-amber-400 active:scale-[0.98]
                transition-colors duration-100"
            >
              CALCULATE
            </button>
          </form>
        </aside>

        {/* ── RESULTS PANEL ───────────────────────────────────────────── */}
        <main>
          <div className="px-5 py-3 border-b-2 border-zinc-800 bg-zinc-950 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Computed Results
            </p>
            {results && (
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 border-2 ${
                results.isStable ? "border-emerald-500 text-emerald-400" : "border-red-500 text-red-400"
              }`}>
                {results.isStable ? "STABLE" : "UNSTABLE"}
              </span>
            )}
          </div>

          {!results && !error && (
            <div className="flex items-center justify-center h-52">
              <p className="font-mono text-xs text-zinc-700 uppercase tracking-widest">
                — fill inputs and press CALCULATE —
              </p>
            </div>
          )}

          {error && (
            <div className="m-5 border-2 border-red-600 bg-red-950/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Error</p>
              <p className="font-mono text-sm text-red-300">{error}</p>
            </div>
          )}

          {results && results.isStable && (
            <div className="p-5">

              {/* Rates & CVs */}
              <Divider label="Rates & Coefficients of Variation" />
              <div className="grid grid-cols-2 sm:grid-cols-4 border-2 border-zinc-800">
                {[
                  { label: "Arrival Rate λ", f: "1 / (1/λ)", v: fmt(results.lambda, 6) },
                  { label: "Service Rate μ", f: "1 / (1/μ)", v: fmt(results.mu, 6) },
                  { label: "Ca²", f: "σ_a² / (1/λ)²", v: fmt(results.ca2, 4) },
                  { label: "Cs²", f: "σ_s² / (1/μ)²", v: fmt(results.cs2, 4) },
                ].map((m, i, arr) => (
                  <div key={i} className={`p-4 ${i < arr.length - 1 ? "border-r-2 border-zinc-800" : ""}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{m.label}</p>
                    <p className="font-mono text-[10px] text-zinc-700 mb-1">{m.f}</p>
                    <p className="font-mono text-xl font-black text-white">{m.v}</p>
                  </div>
                ))}
              </div>

              {/* Utilization & P₀ */}
              <Divider label="Traffic Intensity & Idle Probability" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Metric label="Traffic Intensity / Utilization  ρ" formula="P = λ / (S × μ)" value={fmtPct(results.P)} hi />
                <Metric label="Probability of 0 Customers  P₀" formula="[Σ(S·P)ⁿ/n!  +  (S·P)ˢ/S!·1/(1-P)]⁻¹" value={fmtPct(results.P0)} hi />
              </div>

              {/* Queue length */}
              <Divider label="Queue Length" />
              <div className={`grid grid-cols-1 ${isGG ? "sm:grid-cols-2" : ""} gap-3`}>
                <Metric
                  label={isGG ? "Lq  (M/M/S base — formula 8)" : "Mean Number in Queue  Lq"}
                  formula="(S·P)ˢ × P₀ / (S! × (1-P)²)"
                  value={fmt(results.Lq_mms, 6)}
                  hi={!isGG}
                />
                {isGG && (
                  <Metric
                    label={`Lq effective  (${model})`}
                    formula="λ × Wq  — Little's Law"
                    value={fmt(results.Lq, 6)}
                    hi
                  />
                )}
              </div>

              {/* Wait times */}
              <Divider label="Wait Times" />
              <div className={`grid grid-cols-1 ${isGG ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3`}>
                {isGG && (
                  <Metric label="Wq  (M/M/S base)" formula="Lq_mms / λ" value={fmt(results.Wq_mms, 6)} />
                )}
                <Metric
                  label={isGG ? `Wq  (${model})` : "Mean Wait in Queue  Wq"}
                  formula={isGG ? "(Ca² + Cs²)/2 × Wq_mms" : "Lq / λ"}
                  value={fmt(results.Wq, 6)}
                  hi={isGG}
                />
                <Metric label="Mean Time in System  W" formula="Wq + 1/μ" value={fmt(results.W, 6)} />
              </div>

              {/* System counts */}
              <Divider label="Mean Numbers in System" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Metric
                  label={isGG ? "Lq effective" : "Mean Number in Queue  Lq"}
                  formula={isGG ? "λ × Wq" : "(S·P)ˢ × P₀ / (S! × (1-P)²)"}
                  value={fmt(results.Lq, 6)}
                />
                <Metric label="Mean Number in System  L" formula="Lq + λ/μ  (= λ × W)" value={fmt(results.L, 6)} />
              </div>

              {/* Pₙ calculator */}
              <Divider label="Pₙ — Probability of exactly n customers  (n < S)" />
              <div className="border-2 border-zinc-800 p-4 flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label htmlFor="pn" className="text-[11px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                    Enter n&nbsp;
                    <span className="normal-case font-mono text-zinc-600 text-xs">(must be &lt; S = {S})</span>
                  </label>
                  <input
                    id="pn"
                    type="number"
                    min="0"
                    step="1"
                    value={nInput}
                    onChange={(e) => setNInput(e.target.value)}
                    className="w-full bg-black border-2 border-zinc-700 text-white font-mono text-sm
                      px-3 py-2.5 rounded-none focus:outline-none focus:border-amber-400
                      transition-colors duration-100"
                  />
                </div>
                <div className="flex-1 border-2 border-zinc-700 bg-zinc-950 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">
                    P<sub>{nInput || "0"}</sub> = (S·P)ⁿ/n! × P₀
                  </p>
                  <p className="font-mono text-[10px] text-zinc-600 mb-1">n = {nInput || "0"}, S = {S}</p>
                  <p className="font-mono text-2xl font-black text-amber-400">
                    {pnResult === null
                      ? "—"
                      : isNaN(pnResult)
                      ? `n ≥ S — valid only for n < ${S}`
                      : fmtPct(pnResult)}
                  </p>
                </div>
              </div>

              {/* Formula reference */}
              <Divider label="Formula Reference" />
              <div className="border-2 border-zinc-800 bg-zinc-950 p-4 font-mono text-[11px] text-zinc-500 leading-6 space-y-0.5">
                <p><span className="text-amber-400">λ</span> = 1 / (Inter-Arrival Time)&emsp;<span className="text-zinc-700">or enter λ directly</span></p>
                <p><span className="text-amber-400">μ</span> = 1 / (Service Time)&emsp;<span className="text-zinc-700">or enter μ directly</span></p>
                <p><span className="text-amber-400">Cs²</span> = σ_s² / (1/μ)²</p>
                <p><span className="text-amber-400">Ca²</span> = σ_a² / (1/λ)²</p>
                <p><span className="text-amber-400">P (ρ)</span> = λ / (S × μ) <span className="text-zinc-700">← must be &lt; 1 for stability</span></p>
                <p><span className="text-amber-400">P₀</span> = [ Σ(n=0→S-1) (S·P)ⁿ/n!  +  (S·P)^S/S! × 1/(1-P) ]⁻¹</p>
                <p><span className="text-amber-400">Pₙ</span> = (S·P)ⁿ / n! × P₀ &nbsp;<span className="text-zinc-700">(n &lt; S)</span></p>
                <p><span className="text-amber-400">Lq</span> = (S·P)^S × P₀ / [ S! × (1-P)² ] <span className="text-zinc-700">← same formula all models</span></p>
                <p><span className="text-amber-400">Wq</span> (M/M/S) = Lq / λ</p>
                <p><span className="text-amber-400">Wq</span> (M/G/S &amp; G/G/S) = (Ca² + Cs²)/2 × Wq_mms</p>
                <p><span className="text-amber-400">Lq_eff</span> = λ × Wq &nbsp;<span className="text-zinc-700">← Little&apos;s Law</span></p>
                <p><span className="text-amber-400">W</span> = Wq + 1/μ</p>
                <p><span className="text-amber-400">L</span> = Lq_eff + λ/μ &nbsp;<span className="text-zinc-700">(= λ × W)</span></p>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
