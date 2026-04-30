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

    [Range(0.0000001, double.MaxValue, ErrorMessage = "Service Time must be greater than 0")]
    public double? ServiceTime { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Servers must be at least 1")]
    public int Servers { get; set; } = 1;

    [Range(0, double.MaxValue, ErrorMessage = "Variance must be 0 or greater")]
    public double? Variance { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Service standard deviation must be 0 or greater")]
    public double? ServiceStdDev { get; set; }

    [Range(0.0000001, double.MaxValue, ErrorMessage = "Minimum service time must be greater than 0")]
    public double? ServiceMinTime { get; set; }

    [Range(0.0000001, double.MaxValue, ErrorMessage = "Maximum service time must be greater than 0")]
    public double? ServiceMaxTime { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Ca must be 0 or greater")]
    public double? Ca { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Cs must be 0 or greater")]
    public double? Cs { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Arrival variance must be 0 or greater")]
    public double? ArrivalVariance { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var hasArrivalRate = ArrivalRate.HasValue;
        var hasMeanInterArrival = MeanInterArrivalTime.HasValue;
        var hasServiceTime = ServiceTime.HasValue;
        var hasServiceMin = ServiceMinTime.HasValue;
        var hasServiceMax = ServiceMaxTime.HasValue;
        var hasServiceRange = hasServiceMin || hasServiceMax;

        if (hasArrivalRate == hasMeanInterArrival)
        {
            yield return new ValidationResult(
                "Provide either ArrivalRate or MeanInterArrivalTime (exactly one).",
                [nameof(ArrivalRate), nameof(MeanInterArrivalTime)]);
        }

        if (!hasServiceTime && !hasServiceRange)
        {
            yield return new ValidationResult(
                "Provide either ServiceTime or both ServiceMinTime and ServiceMaxTime.",
                [nameof(ServiceTime), nameof(ServiceMinTime), nameof(ServiceMaxTime)]);
        }

        if (hasServiceRange && (!hasServiceMin || !hasServiceMax))
        {
            yield return new ValidationResult(
                "ServiceMinTime and ServiceMaxTime must both be provided.",
                [nameof(ServiceMinTime), nameof(ServiceMaxTime)]);
        }

        if (hasServiceTime && hasServiceRange)
        {
            yield return new ValidationResult(
                "Provide either ServiceTime or ServiceMinTime/ServiceMaxTime, not both.",
                [nameof(ServiceTime), nameof(ServiceMinTime), nameof(ServiceMaxTime)]);
        }

        if (hasServiceMin && hasServiceMax && ServiceMaxTime!.Value < ServiceMinTime!.Value)
        {
            yield return new ValidationResult(
                "ServiceMaxTime must be greater than or equal to ServiceMinTime.",
                [nameof(ServiceMinTime), nameof(ServiceMaxTime)]);
        }

        if (Variance.HasValue && ServiceStdDev.HasValue)
        {
            yield return new ValidationResult(
                "Provide either Variance or ServiceStdDev, not both.",
                [nameof(Variance), nameof(ServiceStdDev)]);
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