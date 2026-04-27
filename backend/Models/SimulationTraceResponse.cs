namespace QueueSimulatorAPI.Models;

/// <summary>
/// One row of the Poisson CDF lookup table (built from lambda).
/// CumProbLookup = lower bound of the range.
/// CumulativeProbability = upper bound of the range.
/// A random U in [CumProbLookup, CumulativeProbability) maps to K minutes of inter-arrival.
/// </summary>
public class CdfRow
{
    public int K { get; set; }
    public double Pmf { get; set; }
    public double CumProbLookup { get; set; }
    public double CumulativeProbability { get; set; }
}

/// <summary>
/// Per-customer simulation record — mirrors the columns in the assignment Excel sheet.
/// </summary>
public class CustomerRecord
{
    public int No { get; set; }

    // CDF lookup columns (from the CDF table row at index No-1, for display)
    public double CumProbLookup { get; set; }
    public double CumulativeProbability { get; set; }
    public int CdfK { get; set; }

    // Simulation columns
    public double InterArrival { get; set; }
    public double ArrivalTime { get; set; }
    public double ServiceTime { get; set; }
    public double StartTime { get; set; }
    public double EndTime { get; set; }
    public double TurnaroundTime { get; set; }
    public double WaitTime { get; set; }
    public double ResponseTime { get; set; }
}

/// <summary>
/// One segment in the Gantt chart: [Start, End) for a single customer.
/// </summary>
public class GanttSegment
{
    public int CustomerNo { get; set; }
    public double Start { get; set; }
    public double End { get; set; }
    public double Duration { get; set; }
}

/// <summary>
/// Full response returned by the M/M/1 simulator endpoint.
/// </summary>
public class SimulationTraceResponse
{
    public List<CdfRow> CdfTable { get; set; } = new();
    public List<CustomerRecord> Customers { get; set; } = new();
    public List<GanttSegment> GanttSegments { get; set; } = new();

    // Aggregate performance measures
    public double AvgInterarrivalTime { get; set; }
    public double AvgServiceTime { get; set; }
    public double AvgWaitTime { get; set; }
    public double AvgResponseTime { get; set; }
    public double AvgTurnaroundTime { get; set; }

    /// <summary>
    /// Server utilization = total busy time / total simulation time.
    /// </summary>
    public double ServerUtilization { get; set; }
}
