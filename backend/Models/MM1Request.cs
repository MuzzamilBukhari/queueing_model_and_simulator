using System.ComponentModel.DataAnnotations;

namespace QueueSimulatorAPI.Models;

public class MM1Request
{
    [Required]
    [Range(0.0001, double.MaxValue, ErrorMessage = "Mean Interarrival Time must be greater than 0")]
    public double MeanInterarrivalTime { get; set; }

    [Required]
    [Range(0.0001, double.MaxValue, ErrorMessage = "Mean Service Time must be greater than 0")]
    public double MeanServiceTime { get; set; }
}
