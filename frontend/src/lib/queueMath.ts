export type QueueModel = "M/M/S" | "M/G/S" | "G/G/S";

export interface QueueInputs {
  interArrivalTime: number; // Mean inter-arrival time  = 1/λ
  sigmaArrival: number;     // Std dev of arrival time (σ_a) — used only for G/G/S
  serviceTime: number;      // Mean service time         = 1/μ
  sigmaService: number;     // Std dev of service time (σ_s) — used for M/G/S and G/G/S
  servers: number;          // Number of servers (S)
  model: QueueModel;
}

export interface QueueResults {
  // ── Rates ──────────────────────────────────────────────────────────
  lambda: number;    // λ = 1 / interArrivalTime
  mu: number;        // μ = 1 / serviceTime

  // ── Coefficients of variation ──────────────────────────────────────
  ca2: number;       // Ca² = σ_a² / (1/λ)²
  cs2: number;       // Cs² = σ_s² / (1/μ)²

  // ── Traffic intensity ──────────────────────────────────────────────
  P: number;         // ρ = λ / (S × μ)

  // ── Probabilities ──────────────────────────────────────────────────
  P0: number;        // P₀ from formula 6
  Pn: (n: number) => number; // Pₙ from formula 7 (valid only for n < S)

  // ── Queue length ───────────────────────────────────────────────────
  Lq_mms: number;   // Lq from formula 8 — the M/M/S base (same formula for all models)
  Lq: number;       // Effective Lq = λ × Wq  (equals Lq_mms for M/M/S)

  // ── Wait times ─────────────────────────────────────────────────────
  Wq_mms: number;   // Wq for M/M/S = Lq_mms / λ
  Wq: number;       // Final Wq — adjusted for M/G/S & G/G/S by (Ca²+Cs²)/2

  // ── System totals ──────────────────────────────────────────────────
  L: number;        // L = Lq + λ/μ  (Little's Law; uses effective Lq)
  W: number;        // W = Wq + 1/μ

  isStable: boolean;
}

// Iterative factorial — avoids recursion-stack issues for larger S
export function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function computeQueue(inputs: QueueInputs): QueueResults {
  const {
    interArrivalTime,
    sigmaArrival,
    serviceTime,
    sigmaService,
    servers: S,
    model,
  } = inputs;

  // ── 1. λ = 1 / Inter Arrival Time ──────────────────────────────────
  const lambda = 1 / interArrivalTime;

  // ── 2. μ = 1 / service time ─────────────────────────────────────────
  const mu = 1 / serviceTime;

  // ── 3. Cs² = σ_s² / (1/μ)² ─────────────────────────────────────────
  // (1/μ)² = serviceTime², so Cs² = sigmaService² / serviceTime²
  const cs2 = (sigmaService * sigmaService) / Math.pow(1 / mu, 2);

  // ── 4. Ca² = σ_a² / (1/λ)² ─────────────────────────────────────────
  // (1/λ)² = interArrivalTime², so Ca² = sigmaArrival² / interArrivalTime²
  const ca2 = (sigmaArrival * sigmaArrival) / Math.pow(1 / lambda, 2);

  // ── 5. P = λ / (S × μ) ──────────────────────────────────────────────
  const P = lambda / (S * mu);

  const isStable = P < 1;

  const NAN_RESULT: QueueResults = {
    lambda, mu, ca2, cs2, P,
    P0: NaN, Pn: () => NaN,
    Lq_mms: NaN, Lq: NaN,
    Wq_mms: NaN, Wq: NaN,
    L: NaN, W: NaN,
    isStable,
  };

  if (!isStable) return NAN_RESULT;

  // ── 6. P₀ = [Σ(n=0→S-1) (S·P)^n/n!  +  (S·P)^S/S! × 1/(1-P)]^(-1) ──
  let sumTerm = 0;
  for (let n = 0; n <= S - 1; n++) {
    sumTerm += Math.pow(S * P, n) / factorial(n);
  }
  const erlangTerm = (Math.pow(S * P, S) / factorial(S)) * (1 / (1 - P));
  const P0 = 1 / (sumTerm + erlangTerm);

  // ── 7. Pₙ = (S·P)^n / n! × P₀   (valid for n < S only) ────────────
  const Pn = (n: number): number => {
    if (!Number.isInteger(n) || n < 0 || n >= S) return NaN;
    return (Math.pow(S * P, n) / factorial(n)) * P0;
  };

  // ── 8. Lq = (S·P)^S × P₀ / (S! × (1-P)²)  — same formula for all models ──
  const Lq_mms =
    (Math.pow(S * P, S) * P0) / (factorial(S) * Math.pow(1 - P, 2));

  // ── Wq for M/M/S base: Wq_mms = Lq_mms / λ  (Little's Law) ─────────
  const Wq_mms = Lq_mms / lambda;

  // ── Final Wq ──────────────────────────────────────────────────────────
  //   M/M/S            → Wq = Wq_mms
  //   M/G/S & G/G/S    → Wq = (Ca² + Cs²) / 2 × Wq_mms
  const Wq =
    model === "M/M/S" ? Wq_mms : ((ca2 + cs2) / 2) * Wq_mms;

  // ── Effective Lq = λ × Wq  (Little's Law; keeps L consistent with W) ─
  // For M/M/S this equals Lq_mms exactly.
  const Lq = lambda * Wq;

  // ── W = Wq + 1/μ ────────────────────────────────────────────────────
  const W = Wq + 1 / mu;

  // ── L = Lq + λ/μ  (= λ × W by Little's Law) ────────────────────────
  const L = Lq + lambda / mu;

  return { lambda, mu, ca2, cs2, P, P0, Pn, Lq_mms, Lq, Wq_mms, Wq, L, W, isStable };
}
