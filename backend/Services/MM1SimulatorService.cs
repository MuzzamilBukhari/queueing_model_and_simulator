using QueueSimulatorAPI.Models;

namespace QueueSimulatorAPI.Services;

/// <summary>
/// Discrete-event M/M/1 simulator.
///
/// Inter-arrival:  Poisson CDF lookup table (range check on a U(0,1) draw).
///                 Customer 1 always arrives at time 0 (inter-arrival = 0).
/// Service time:   Exponential via -mu * ln(U), rounded to nearest whole minute.
/// Server policy:  FCFS, single server. start[i] = max(arrival[i], end[i-1]).
/// </summary>
public class MM1SimulatorService
{
    public SimulationTraceResponse Simulate(SimulationTraceRequest request)
    {
        if (request.Lambda <= 0)
            throw new ArgumentException("Lambda must be greater than 0.");
        if (request.Mu <= 0)
            throw new ArgumentException("Mu must be greater than 0.");
        if (request.NumCustomers < 1 || request.NumCustomers > 100)
            throw new ArgumentException("NumCustomers must be between 1 and 100.");

        var rng = request.Seed.HasValue
            ? new Random(request.Seed.Value)
            : new Random();

        // Step 1 — build Poisson CDF lookup table from lambda
        var cdfTable = BuildCdfTable(request.Lambda);

        // Step 2 — simulate N customers
        var customers = new List<CustomerRecord>(request.NumCustomers);
        double prevEnd = 0;
        double prevArrival = 0;
        double totalServiceTime = 0;

        for (int i = 1; i <= request.NumCustomers; i++)
        {
            // --- Inter-arrival (Poisson CDF lookup) ---
            double interArrival;
            double cumProbLookup;
            double cumulativeProbability;
            int cdfK;

            if (i == 1)
            {
                // First customer: always arrives at time 0
                interArrival = 0;
                var firstRow = cdfTable[0];
                cumProbLookup = firstRow.CumProbLookup;
                cumulativeProbability = firstRow.CumulativeProbability;
                cdfK = firstRow.K;
            }
            else
            {
                double u1 = rng.NextDouble();
                cdfK = LookupCdf(cdfTable, u1);
                interArrival = cdfK;

                // Find the matching CDF row for display purposes
                var row = cdfTable.FirstOrDefault(r => r.K == cdfK) ?? cdfTable[^1];
                cumProbLookup = row.CumProbLookup;
                cumulativeProbability = row.CumulativeProbability;
            }

            double arrivalTime = prevArrival + interArrival;

            // --- Service time: -mu * ln(U), rounded to nearest minute ---
            double u2 = rng.NextDouble();
            if (u2 <= 0) u2 = 1e-10; // guard against ln(0)
            double rawService = -request.Mu * Math.Log(u2);
            double serviceTime = Math.Max(1, Math.Round(rawService)); // minimum 1 min

            // --- Schedule on the single server (FCFS) ---
            double startTime = Math.Max(arrivalTime, prevEnd);
            double endTime = startTime + serviceTime;

            // --- Per-customer metrics ---
            double waitTime = startTime - arrivalTime;
            double turnaroundTime = endTime - arrivalTime;
            double responseTime = waitTime; // for FCFS single-server, response = wait

            customers.Add(new CustomerRecord
            {
                No = i,
                CumProbLookup = cumProbLookup,
                CumulativeProbability = cumulativeProbability,
                CdfK = cdfK,
                InterArrival = interArrival,
                ArrivalTime = arrivalTime,
                ServiceTime = serviceTime,
                StartTime = startTime,
                EndTime = endTime,
                TurnaroundTime = turnaroundTime,
                WaitTime = waitTime,
                ResponseTime = responseTime
            });

            totalServiceTime += serviceTime;
            prevEnd = endTime;
            prevArrival = arrivalTime;
        }

        // Step 3 — Gantt segments
        var ganttSegments = customers
            .Select(c => new GanttSegment
            {
                CustomerNo = c.No,
                Start = c.StartTime,
                End = c.EndTime,
                Duration = c.ServiceTime
            })
            .ToList();

        // Step 4 — Aggregate performance measures
        double totalSimTime = customers[^1].EndTime;
        double avgInterarrival = customers.Average(c => c.InterArrival);
        double avgService = customers.Average(c => c.ServiceTime);
        double avgWait = customers.Average(c => c.WaitTime);
        double avgResponse = customers.Average(c => c.ResponseTime);
        double avgTurnaround = customers.Average(c => c.TurnaroundTime);
        double serverUtilization = totalSimTime > 0 ? totalServiceTime / totalSimTime : 0;

        return new SimulationTraceResponse
        {
            CdfTable = cdfTable,
            Customers = customers,
            GanttSegments = ganttSegments,
            AvgInterarrivalTime = Math.Round(avgInterarrival, 5),
            AvgServiceTime = Math.Round(avgService, 5),
            AvgWaitTime = Math.Round(avgWait, 5),
            AvgResponseTime = Math.Round(avgResponse, 5),
            AvgTurnaroundTime = Math.Round(avgTurnaround, 5),
            ServerUtilization = Math.Round(serverUtilization, 5)
        };
    }

    /// <summary>
    /// Builds the Poisson CDF table for the given lambda.
    /// Each row: K, Pmf, CumProbLookup (lower bound), CumulativeProbability (upper bound).
    /// A random U in [CumProbLookup, CumulativeProbability) → inter-arrival = K minutes.
    /// </summary>
    private static List<CdfRow> BuildCdfTable(double lambda)
    {
        var table = new List<CdfRow>();
        double pmf = Math.Exp(-lambda); // P(X = 0)
        double cumulative = 0;
        int k = 0;

        // Build until CDF reaches 1.00000 at 5 decimal places
        while (Math.Round(cumulative, 5) < 1.0)
        {
            double prevCumulative = Math.Round(cumulative, 5);
            cumulative += pmf;
            double currentCumulative = Math.Round(cumulative, 5);
            if (currentCumulative > 1.0) currentCumulative = 1.0;

            double lookup = prevCumulative == 0 ? 0.00001 : Math.Round(prevCumulative + 0.00001, 5);

            table.Add(new CdfRow
            {
                K = k,
                Pmf = Math.Round(pmf, 5),
                CumProbLookup = lookup,
                CumulativeProbability = currentCumulative
            });

            k++;
            pmf = pmf * lambda / k;
        }

        return table;
    }

    /// <summary>
    /// Given a uniform random U in [0,1), returns the inter-arrival k such that
    /// CumProbLookup[k] ≤ U < CumulativeProbability[k].
    /// </summary>
    private static int LookupCdf(List<CdfRow> cdfTable, double u)
    {
        foreach (var row in cdfTable)
        {
            if (u < row.CumulativeProbability)
                return row.K;
        }
        return cdfTable[^1].K; // fallback: last row
    }
}
