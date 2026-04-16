using System.ComponentModel.DataAnnotations;

namespace QueueSimulatorAPI.Models;

public class QueueSimulationRequest : IValidatableObject
{
    public string? Model { get; set; }
    public bool AutoDetectModel { get; set; }
    public string? ArrivalDistribution { get; set; }
    public string? ServiceDistribution { get; set; }

    [Range(0.0000001, double.MaxValue, ErrorMessage = "Arrival Rate must be greater than 0")]
    public double? ArrivalRate { get; set; }

    [Range(0.0000001, double.MaxValue, ErrorMessage = "Mean Inter-arrival Time must be greater than 0")]
    public double? MeanInterArrivalTime { get; set; }

    [Required]
    [Range(0.0000001, double.MaxValue, ErrorMessage = "Service Time must be greater than 0")]
    public double ServiceTime { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Servers must be at least 1")]
    public int Servers { get; set; } = 1;

    [Range(0, double.MaxValue, ErrorMessage = "Variance must be 0 or greater")]
    public double? Variance { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Ca must be 0 or greater")]
    public double? Ca { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Cs must be 0 or greater")]
    public double? Cs { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var hasArrivalRate = ArrivalRate.HasValue;
        var hasMeanInterArrival = MeanInterArrivalTime.HasValue;

        if (hasArrivalRate == hasMeanInterArrival)
        {
            yield return new ValidationResult(
                "Provide either ArrivalRate or MeanInterArrivalTime (exactly one).",
                [nameof(ArrivalRate), nameof(MeanInterArrivalTime)]);
        }

        if (AutoDetectModel)
        {
            if (string.IsNullOrWhiteSpace(ArrivalDistribution))
            {
                yield return new ValidationResult(
                    "ArrivalDistribution is required when AutoDetectModel is true.",
                    [nameof(ArrivalDistribution)]);
            }

            if (string.IsNullOrWhiteSpace(ServiceDistribution))
            {
                yield return new ValidationResult(
                    "ServiceDistribution is required when AutoDetectModel is true.",
                    [nameof(ServiceDistribution)]);
            }
        }
        else if (string.IsNullOrWhiteSpace(Model))
        {
            yield return new ValidationResult(
                "Model is required in manual mode.",
                [nameof(Model)]);
        }
    }
}