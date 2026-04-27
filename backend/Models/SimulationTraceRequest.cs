using System.ComponentModel.DataAnnotations;

namespace QueueSimulatorAPI.Models;

public class SimulationTraceRequest
{
    [Required]
    [Range(0.0001, double.MaxValue, ErrorMessage = "Lambda (arrival rate) must be greater than 0")]
    public double Lambda { get; set; }

    [Required]
    [Range(0.0001, double.MaxValue, ErrorMessage = "Mu (mean service time) must be greater than 0")]
    public double Mu { get; set; }

    [Range(1, 100, ErrorMessage = "Number of customers must be between 1 and 100")]
    public int NumCustomers { get; set; } = 8;

    /// <summary>
    /// Optional RNG seed for reproducible results (e.g. grading screenshots).
    /// Leave null for fresh randomness.
    /// </summary>
    public int? Seed { get; set; }
}
