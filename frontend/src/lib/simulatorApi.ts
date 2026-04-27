// Types mirroring the C# backend models (camelCase as serialized by ASP.NET Core)

export interface SimulateRequest {
  lambda: number;
  mu: number;
  numCustomers: number;
  seed?: number;
}

export interface CdfRow {
  k: number;
  pmf: number;
  cumProbLookup: number;
  cumulativeProbability: number;
}

export interface CustomerRecord {
  no: number;
  cumProbLookup: number;
  cumulativeProbability: number;
  cdfK: number;
  interArrival: number;
  arrivalTime: number;
  serviceTime: number;
  startTime: number;
  endTime: number;
  turnaroundTime: number;
  waitTime: number;
  responseTime: number;
}

export interface GanttSegment {
  customerNo: number;
  start: number;
  end: number;
  duration: number;
}

export interface SimulateResponse {
  cdfTable: CdfRow[];
  customers: CustomerRecord[];
  ganttSegments: GanttSegment[];
  avgInterarrivalTime: number;
  avgServiceTime: number;
  avgWaitTime: number;
  avgResponseTime: number;
  avgTurnaroundTime: number;
  serverUtilization: number;
}

export async function runMM1Simulation(
  payload: SimulateRequest,
): Promise<SimulateResponse> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const response = await fetch(`${apiUrl}/api/simulation/mm1/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed: ${response.status}`);
  }

  return response.json();
}
