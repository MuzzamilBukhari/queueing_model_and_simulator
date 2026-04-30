using QueueSimulatorAPI.Models;

namespace QueueSimulatorAPI.Services;

public class QueueModelService
{
    public QueueSimulationResponse Calculate(QueueSimulationRequest request)
    {
        var lambda = ResolveArrivalRate(request.ArrivalRate, request.MeanInterArrivalTime);
        var model = ResolveModel(request);
        var serviceMoments = ResolveServiceMoments(request, model);
        var mu = ResolveServiceRate(serviceMoments.MeanServiceTime);

        return model switch
        {
            "M/M/1" => CalculateMMs(lambda, mu, 1),
            "M/M/S" => CalculateMMs(lambda, mu, request.Servers),
            "M/G/1" => CalculateMG1(lambda, mu, serviceMoments.Variance),
            "M/G/S" => CalculateMGs(lambda, mu, request.Servers, serviceMoments.Variance),
            "G/G/1" => CalculateGG1(lambda, mu, request.Ca, request.Cs, request.ArrivalVariance, serviceMoments.Variance),
            "G/G/S" => CalculateGGs(lambda, mu, request.Servers, request.Ca, request.Cs, request.ArrivalVariance, serviceMoments.Variance),
            _ => throw new ArgumentException($"Unsupported model: {model}")
        };
    }

    public QueueSimulationResponse CalculateMMs(double lambda, double mu, int servers)
    {
        if (servers <= 0)
        {
            throw new ArgumentException("Servers must be at least 1.");
        }

        ValidatePositive(lambda, nameof(lambda));
        ValidatePositive(mu, nameof(mu));

        var rho = lambda / (servers * mu);
        EnsureStable(rho);

        var a = lambda / mu;
        var denominator = 0.0;

        for (var n = 0; n < servers; n++)
        {
            denominator += Math.Pow(a, n) / Factorial(n);
        }

        denominator += Math.Pow(a, servers) / (Factorial(servers) * (1 - rho));
        var p0 = 1.0 / denominator;

        var lq = (p0 * Math.Pow(a, servers) * rho) /
                 (Factorial(servers) * Math.Pow(1 - rho, 2));

        var l = lq + a;
        var wq = lq / lambda;
        var w = wq + (1.0 / mu);

        return new QueueSimulationResponse
        {
            Model = servers == 1 ? "M/M/1" : "M/M/s",
            Rho = rho,
            L = l,
            Lq = lq,
            W = w,
            Wq = wq,
            P0 = p0
        };
    }

    public QueueSimulationResponse CalculateMG1(double lambda, double mu, double? variance)
    {
        ValidatePositive(lambda, nameof(lambda));
        ValidatePositive(mu, nameof(mu));

        if (!variance.HasValue)
        {
            throw new ArgumentException("Variance is required for M/G/1.");
        }

        if (variance.Value < 0)
        {
            throw new ArgumentException("Variance must be 0 or greater.");
        }

        var rho = lambda / mu;
        EnsureStable(rho);

        var lq = (Math.Pow(lambda, 2) * variance.Value + Math.Pow(rho, 2)) /
                 (2 * (1 - rho));

        var wq = lq / lambda;
        var w = wq + (1.0 / mu);
        var l = lambda * w;

        return new QueueSimulationResponse
        {
            Model = "M/G/1",
            Rho = rho,
            L = l,
            Lq = lq,
            W = w,
            Wq = wq
        };
    }

    public QueueSimulationResponse CalculateGG1(
        double lambda,
        double mu,
        double? ca,
        double? cs,
        double? arrivalVariance,
        double? serviceVariance)
    {
        ValidatePositive(lambda, nameof(lambda));
        ValidatePositive(mu, nameof(mu));

        var rho = lambda / mu;
        EnsureStable(rho);

        var (caSquared, csSquared) = ResolveSquaredCVs(lambda, mu, ca, cs, arrivalVariance, serviceVariance, "G/G/1");

        var denominator = 2 * (1 - rho) * (1 + Math.Pow(rho, 2) * csSquared);
        if (denominator <= 0)
        {
            throw new InvalidOperationException("Invalid denominator while computing G/G/1 metrics.");
        }

        var lq =
            (Math.Pow(rho, 2) * (1 + csSquared) * (caSquared + Math.Pow(rho, 2) * csSquared)) /
            denominator;

        if (double.IsNaN(lq) || double.IsInfinity(lq))
        {
            throw new InvalidOperationException("Failed to compute finite G/G/1 queue length.");
        }

        lq = Math.Max(0, lq);

        var wq = Math.Max(0, lq / lambda);
        var w = wq + (1.0 / mu);
        var l = lambda * w;

        return new QueueSimulationResponse
        {
            Model = "G/G/1",
            Rho = rho,
            L = l,
            Lq = lq,
            W = w,
            Wq = wq
        };
    }

    public QueueSimulationResponse CalculateMGs(double lambda, double mu, int servers, double? variance)
    {
        ValidatePositive(lambda, nameof(lambda));
        ValidatePositive(mu, nameof(mu));

        if (servers <= 0)
        {
            throw new ArgumentException("Servers must be at least 1.");
        }

        if (servers == 1)
        {
            return CalculateMG1(lambda, mu, variance);
        }

        if (!variance.HasValue)
        {
            throw new ArgumentException("Variance is required for M/G/s.");
        }

        if (variance.Value < 0)
        {
            throw new ArgumentException("Variance must be 0 or greater.");
        }

        var csSquared = variance.Value * Math.Pow(mu, 2);

        return CalculateGGsApprox(lambda, mu, servers, 1.0, csSquared, "M/G/s");
    }

    public QueueSimulationResponse CalculateGGs(
        double lambda,
        double mu,
        int servers,
        double? ca,
        double? cs,
        double? arrivalVariance,
        double? serviceVariance)
    {
        ValidatePositive(lambda, nameof(lambda));
        ValidatePositive(mu, nameof(mu));

        if (servers <= 0)
        {
            throw new ArgumentException("Servers must be at least 1.");
        }

        if (servers == 1)
        {
            return CalculateGG1(lambda, mu, ca, cs, arrivalVariance, serviceVariance);
        }

        var (caSquared, csSquared) = ResolveSquaredCVs(lambda, mu, ca, cs, arrivalVariance, serviceVariance, "G/G/s");
        return CalculateGGsApprox(lambda, mu, servers, caSquared, csSquared, "G/G/s");
    }

    private static string ResolveModel(QueueSimulationRequest request)
    {
        if (!request.AutoDetectModel)
        {
            return NormalizeModel(request.Model ?? string.Empty, request.Servers);
        }

        var arrivalClass = MapDistributionToKendallSymbol(request.ArrivalDistribution);
        var serviceClass = MapDistributionToKendallSymbol(request.ServiceDistribution);
        var servers = request.Servers;

        if (servers <= 0)
        {
            throw new ArgumentException("Servers must be at least 1.");
        }

        if (servers > 1)
        {
            if (arrivalClass == "M" && serviceClass == "M")
            {
                return "M/M/S";
            }

            throw new ArgumentException("Only M/M/s is supported for multi-server mode.");
        }

        return $"{arrivalClass}/{serviceClass}/1";
    }

    private static string NormalizeModel(string model, int servers)
    {
        var normalized = model.Trim().ToUpperInvariant();

        if (normalized == "M/M/S")
        {
            if (servers < 1)
            {
                throw new ArgumentException("Servers must be at least 1.");
            }

            return servers == 1 ? "M/M/1" : "M/M/S";
        }

        if (normalized == "M/G/S")
        {
            if (servers < 1)
            {
                throw new ArgumentException("Servers must be at least 1.");
            }

            return servers == 1 ? "M/G/1" : "M/G/S";
        }

        if (normalized == "G/G/S")
        {
            if (servers < 1)
            {
                throw new ArgumentException("Servers must be at least 1.");
            }

            return servers == 1 ? "G/G/1" : "G/G/S";
        }

        return normalized;
    }

    private QueueSimulationResponse CalculateGGsApprox(
        double lambda,
        double mu,
        int servers,
        double caSquared,
        double csSquared,
        string modelLabel)
    {
        var rho = lambda / (servers * mu);
        EnsureStable(rho);

        var erlangC = CalculateErlangC(lambda, mu, servers);
        var variabilityFactor = (caSquared + csSquared) / 2.0;
        var wq = variabilityFactor * (erlangC / (servers * mu - lambda));
        var w = wq + (1.0 / mu);
        var lq = lambda * wq;
        var l = lambda * w;

        return new QueueSimulationResponse
        {
            Model = modelLabel,
            Rho = rho,
            L = l,
            Lq = lq,
            W = w,
            Wq = wq
        };
    }

    private static double CalculateErlangC(double lambda, double mu, int servers)
    {
        var a = lambda / mu;
        var rho = lambda / (servers * mu);

        var denominator = 0.0;
        for (var n = 0; n < servers; n++)
        {
            denominator += Math.Pow(a, n) / Factorial(n);
        }

        var top = Math.Pow(a, servers) / (Factorial(servers) * (1 - rho));
        denominator += top;

        return top / denominator;
    }

    private static (double caSquared, double csSquared) ResolveSquaredCVs(
        double lambda,
        double mu,
        double? ca,
        double? cs,
        double? arrivalVariance,
        double? serviceVariance,
        string modelLabel)
    {
        double? caSquaredFromVariance = null;
        double? csSquaredFromVariance = null;

        if (arrivalVariance.HasValue)
        {
            if (arrivalVariance.Value < 0)
            {
                throw new ArgumentException("ArrivalVariance must be 0 or greater.");
            }

            caSquaredFromVariance = arrivalVariance.Value * Math.Pow(lambda, 2);
        }

        if (serviceVariance.HasValue)
        {
            if (serviceVariance.Value < 0)
            {
                throw new ArgumentException("Service variance must be 0 or greater.");
            }

            csSquaredFromVariance = serviceVariance.Value * Math.Pow(mu, 2);
        }

        var caSquared = caSquaredFromVariance ?? ca;
        var csSquared = csSquaredFromVariance ?? cs;

        if (!caSquared.HasValue || !csSquared.HasValue)
        {
            throw new ArgumentException($"Provide Ca/Cs (as squared CV values) or variances for {modelLabel}.");
        }

        if (caSquared.Value < 0 || csSquared.Value < 0)
        {
            throw new ArgumentException("Ca and Cs (squared CV values) must be 0 or greater.");
        }

        return (caSquared.Value, csSquared.Value);
    }

    private static string MapDistributionToKendallSymbol(string? distribution)
    {
        if (string.IsNullOrWhiteSpace(distribution))
        {
            throw new ArgumentException("Distribution value is required for auto-detection.");
        }

        var normalized = distribution.Trim().ToLowerInvariant();
        return normalized switch
        {
            "poisson" => "M",
            "exponential" => "M",
            "uniform" => "G",
            "normal" => "G",
            "gamma" => "G",
            "general" => "G",
            _ => throw new ArgumentException($"Unsupported distribution: {distribution}")
        };
    }

    private static ServiceMoments ResolveServiceMoments(QueueSimulationRequest request, string model)
    {
        double meanServiceTime;
        double? variance = null;

        if (request.ServiceTime.HasValue)
        {
            ValidatePositive(request.ServiceTime.Value, nameof(request.ServiceTime));
            meanServiceTime = request.ServiceTime.Value;

            if (request.Variance.HasValue)
            {
                if (request.Variance.Value < 0)
                {
                    throw new ArgumentException("Variance must be 0 or greater.");
                }

                variance = request.Variance.Value;
            }
            else if (request.ServiceStdDev.HasValue)
            {
                if (request.ServiceStdDev.Value < 0)
                {
                    throw new ArgumentException("Service standard deviation must be 0 or greater.");
                }

                variance = Math.Pow(request.ServiceStdDev.Value, 2);
            }
        }
        else
        {
            if (!request.ServiceMinTime.HasValue || !request.ServiceMaxTime.HasValue)
            {
                throw new ArgumentException("Provide ServiceTime or both ServiceMinTime and ServiceMaxTime.");
            }

            var min = request.ServiceMinTime.Value;
            var max = request.ServiceMaxTime.Value;

            ValidatePositive(min, nameof(request.ServiceMinTime));
            ValidatePositive(max, nameof(request.ServiceMaxTime));

            if (max < min)
            {
                throw new ArgumentException("ServiceMaxTime must be greater than or equal to ServiceMinTime.");
            }

            meanServiceTime = (min + max) / 2.0;
            variance = Math.Pow(max - min, 2) / 12.0;
        }

        if (model == "M/G/1" && !variance.HasValue)
        {
            throw new ArgumentException("Variance, ServiceStdDev, or ServiceMinTime/ServiceMaxTime is required for M/G/1.");
        }

        return new ServiceMoments(meanServiceTime, variance);
    }

    private static double ResolveArrivalRate(double? arrivalRate, double? meanInterArrivalTime)
    {
        if (arrivalRate.HasValue && meanInterArrivalTime.HasValue)
        {
            throw new ArgumentException("Provide either ArrivalRate or MeanInterArrivalTime, not both.");
        }

        if (arrivalRate.HasValue)
        {
            ValidatePositive(arrivalRate.Value, nameof(arrivalRate));
            return arrivalRate.Value;
        }

        if (!meanInterArrivalTime.HasValue)
        {
            throw new ArgumentException("Either ArrivalRate or MeanInterArrivalTime is required.");
        }

        ValidatePositive(meanInterArrivalTime.Value, nameof(meanInterArrivalTime));
        return 1.0 / meanInterArrivalTime.Value;
    }

    private static double ResolveServiceRate(double serviceTime)
    {
        ValidatePositive(serviceTime, nameof(serviceTime));
        return 1.0 / serviceTime;
    }

    private static void ValidatePositive(double value, string parameterName)
    {
        if (value <= 0)
        {
            throw new ArgumentException($"{parameterName} must be greater than 0.");
        }
    }

    private static void EnsureStable(double rho)
    {
        if (rho >= 1.0)
        {
            throw new InvalidOperationException("System unstable. Utilization (rho) must be less than 1.");
        }
    }

    private static double Factorial(int n)
    {
        if (n < 0)
        {
            throw new ArgumentException("Factorial is undefined for negative values.");
        }

        var result = 1.0;
        for (var i = 2; i <= n; i++)
        {
            result *= i;
        }

        return result;
    }

    private readonly record struct ServiceMoments(double MeanServiceTime, double? Variance);
}