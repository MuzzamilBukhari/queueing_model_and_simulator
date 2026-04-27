# M/M/1 Simulator — Implementation Plan

## Goal
Add a discrete-event M/M/1 simulator to the existing OptiQueue app.  
The simulator replicates the Excel spreadsheet approach from the assignment:  
generate N customers, roll random numbers, walk them through one server, draw a Gantt chart, report 6 performance measures.

This does **not** touch the existing analytical calculator (Queueing Models tab).  
The "Simulator" tab already exists in the sidebar but renders nothing — we fill it in.

---

## Inputs (what the user types)

| Field | Variable | Notes |
|---|---|---|
| Arrival rate | λ (lambda) | e.g. 2.65 customers/min |
| Mean service time | μ (mu) | e.g. 7.45 minutes (NOT a rate — matches the Excel `-u*ln(rand())` convention) |
| Number of customers | N | default 8, min 1, max 100 |
| Seed (optional) | seed | integer; blank = random; useful for reproducible grading screenshots |
| Round to whole minutes | roundTimes | toggle, default ON (to match the Excel exactly) |

---

## How the Simulation Works (Step by Step)

### Step 0 — Build the Poisson CDF table (once per run)

Using λ, compute P(X ≤ k) for k = 0, 1, 2, … until cumulative prob > 0.9999.

```
pmf(0) = e^(-λ)
pmf(k) = pmf(k-1) * λ / k

cdf(k) = cdf(k-1) + pmf(k)
```

This produces the two columns the Excel shows:
- **Cummulative Probability** = cdf(k)
- **Cum Prob Lookup** = cdf(k-1), starts at 0

### Step 1 — For each customer i = 1..N, generate interarrival time

1. Draw `U1 = rand()` (0..1)
2. Find k such that `cdf(k-1) ≤ U1 < cdf(k)` — that k is the interarrival gap in minutes
3. If `roundTimes = true`, use k directly (integer minutes)
4. If `roundTimes = false`, use the continuous exponential: `-1/λ * ln(U1)`

### Step 2 — Compute cumulative arrival time

```
arrival[1] = 0
arrival[i] = arrival[i-1] + interarrival[i]   (for i > 1)
```

### Step 3 — For each customer, generate service time (exponential)

```
service[i] = -mu * ln(U2)    where U2 = rand()
if roundTimes: service[i] = round(service[i])
```

### Step 4 — Schedule the server (FCFS single server)

```
start[1] = arrival[1] = 0
end[1]   = start[1] + service[1]

start[i] = max(arrival[i], end[i-1])
end[i]   = start[i] + service[i]
```

### Step 5 — Per-customer metrics

```
wait[i]       = start[i] - arrival[i]
turnaround[i] = end[i]   - arrival[i]
response[i]   = wait[i]                   (same as wait in FCFS single server)
```

### Step 6 — Aggregate performance measures

| Measure | Formula |
|---|---|
| Avg Interarrival Time | mean of interarrival[i] |
| Avg Service Time | mean of service[i] |
| Avg Wait Time | mean of wait[i] |
| Avg Response Time | mean of response[i] |
| Avg Turnaround Time | mean of turnaround[i] |
| Server Utilization (ρ) | Σ service[i] / end[N] |

---

## Backend Changes (C# / ASP.NET)

### New Files

#### `backend/Models/SimulationTraceRequest.cs`
```
{
  double Lambda,        // arrival rate (λ)
  double Mu,           // mean service TIME (μ) — not a rate
  int NumCustomers,    // N, default 8
  int? Seed,           // optional RNG seed
  bool RoundTimes      // round to whole minutes, default true
}
```

#### `backend/Models/SimulationTraceResponse.cs`
```
{
  // Poisson CDF table (for display)
  List<CdfRow> CdfTable,

  // Per-customer trace table
  List<CustomerRecord> Customers,

  // Gantt chart segments
  List<GanttSegment> GanttSegments,

  // Aggregate measures
  double AvgInterarrivalTime,
  double AvgServiceTime,
  double AvgWaitTime,
  double AvgResponseTime,
  double AvgTurnaroundTime,
  double ServerUtilization
}
```

Sub-types:
```
CdfRow         { int K, double Pmf, double CumProbLookup, double CumulativeProbability }
CustomerRecord { int No, double CumProbLookup, double CumulativeProbability,
                 double InterArrival, double ArrivalTime, double ServiceTime,
                 double StartTime, double EndTime,
                 double TurnaroundTime, double WaitTime, double ResponseTime }
GanttSegment   { int CustomerNo, double Start, double End, double Duration }
```

#### `backend/Services/MM1SimulatorService.cs`
- Contains all the logic described in "How the Simulation Works" above
- Uses `System.Random` seeded with `Seed` if provided, otherwise `new Random()`
- Pure function: `SimulationTraceResponse Simulate(SimulationTraceRequest request)`
- Validates `lambda > 0`, `mu > 0`, `1 ≤ N ≤ 100`

### Modified Files

#### `backend/Controllers/SimulationController.cs`
- Add one new endpoint:  
  `POST /api/simulation/mm1/simulate`  
  → calls `MM1SimulatorService.Simulate(request)` → returns `SimulationTraceResponse`
- Existing `/calculate` and `/mm1` endpoints are **untouched**

#### `backend/Program.cs`
- Add one line:  
  `builder.Services.AddScoped<MM1SimulatorService>();`

---

## Frontend Changes (Next.js / TypeScript)

### New Files

#### `frontend/src/components/simulator/SimulatorForm.tsx`
- Inputs: λ, μ, N, seed, round toggle
- "Run Simulation" button
- Calls `POST /api/simulation/mm1/simulate`
- Shows loading spinner / toast on error

#### `frontend/src/components/simulator/CdfTable.tsx`
- Shows the Poisson CDF table (the two columns from the Excel)
- Collapsible (hidden by default so it doesn't clutter the page)

#### `frontend/src/components/simulator/TraceTable.tsx`
- Renders the per-customer table (matches Excel columns exactly):
  S.No | Cum Prob Lookup | Cummulative Prob | Inter Arrival | Arrival Time | Service Time | Start | End | Turnaround | Wait | Response

#### `frontend/src/components/simulator/GanttChart.tsx`
- Horizontal bar chart, one row per customer
- Each bar spans `[start, end]` on a shared time axis
- Customer label on the left (C1, C2, …)
- Uses only CSS/SVG — no new npm packages
- Shows idle gaps (server waiting) in a lighter color

#### `frontend/src/components/simulator/SimulationSummary.tsx`
- 6 metric cards matching the existing ResultsPanel style:
  Avg Interarrival | Avg Service | Avg Wait | Avg Response | Avg Turnaround | Server Utilization ρ

#### `frontend/src/lib/simulatorApi.ts`
- One exported function:  
  `runMM1Simulation(payload) → Promise<SimulationTraceResponse>`
- Uses `NEXT_PUBLIC_API_URL` from `.env.local` (already exists)

### Modified Files

#### `frontend/src/app/page.tsx`
- The `activeTab === 'simulator'` branch currently renders nothing
- Wire it to render the new `SimulatorView` (a wrapper that holds the 5 components above)
- No changes to the `home` or `models` branches

---

## File Summary (touch count)

| File | Action |
|---|---|
| `backend/Models/SimulationTraceRequest.cs` | **CREATE** |
| `backend/Models/SimulationTraceResponse.cs` | **CREATE** |
| `backend/Services/MM1SimulatorService.cs` | **CREATE** |
| `backend/Controllers/SimulationController.cs` | **EDIT** — add 1 endpoint |
| `backend/Program.cs` | **EDIT** — add 1 DI line |
| `frontend/src/components/simulator/SimulatorForm.tsx` | **CREATE** |
| `frontend/src/components/simulator/CdfTable.tsx` | **CREATE** |
| `frontend/src/components/simulator/TraceTable.tsx` | **CREATE** |
| `frontend/src/components/simulator/GanttChart.tsx` | **CREATE** |
| `frontend/src/components/simulator/SimulationSummary.tsx` | **CREATE** |
| `frontend/src/lib/simulatorApi.ts` | **CREATE** |
| `frontend/src/app/page.tsx` | **EDIT** — wire simulator tab |

Total: 8 new files, 3 small edits. Zero changes to existing calculator logic.

---

## Build Order

1. **Backend models** (`SimulationTraceRequest`, `SimulationTraceResponse`)
2. **Backend service** (`MM1SimulatorService`) — core math, fully testable
3. **Backend controller + DI** — expose the endpoint, smoke-test via `MM1Test.http`
4. **Frontend API helper** (`simulatorApi.ts`)
5. **Frontend components** (`SimulatorForm` → `TraceTable` → `GanttChart` → `SimulationSummary` → `CdfTable`)
6. **Wire the simulator tab** in `page.tsx`

---

## Open Questions for Approval

1. **μ = 7.45 as mean service TIME** (not rate) — matches your Excel. Confirmed OK?
2. **Round to whole minutes ON by default** — so numbers match teacher's sheet. OK?
3. **N = 8 default** — same as the assignment example. OK?
4. **Homework Q2 (2 servers)** — include in this batch or leave for later?
