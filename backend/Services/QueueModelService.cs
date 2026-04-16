using QueueSimulatorAPI.Models;

namespace QueueSimulatorAPI.Services;

public class QueueModelService
{
    public QueueSimulationResponse Calculate(QueueSimulationRequest request)
    {
        var lambda = ResolveArrivalRate(request.ArrivalRate, request.MeanInterArrivalTime);
        var mu = ResolveServiceRate(request.ServiceTime);
        var model = ResolveModel(request);

        return model switch
        {
            "M/M/1" => CalculateMMs(lambda, mu, 1),
            "M/M/S" => CalculateMMs(lambda, mu, request.Servers),
            "M/G/1" => CalculateMG1(lambda, mu, request.Variance),
            "G/G/1" => CalculateGG1(lambda, mu, request.Ca, request.Cs),
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

    public QueueSimulationResponse CalculateGG1(double lambda, double mu, double? ca, double? cs)
    {
        ValidatePositive(lambda, nameof(lambda));
        ValidatePositive(mu, nameof(mu));

        if (!ca.HasValue || !cs.HasValue)
        {
            throw new ArgumentException("Ca and Cs are required for G/G/1.");
        }

        if (ca.Value < 0 || cs.Value < 0)
        {
            throw new ArgumentException("Ca and Cs must be 0 or greater.");
        }

        var rho = lambda / mu;
        EnsureStable(rho);

        var wq = (rho / (1 - rho)) * ((Math.Pow(ca.Value, 2) + Math.Pow(cs.Value, 2)) / 2.0) * (1 / mu);
        var w = wq + (1.0 / mu);
        var lq = lambda * wq;
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

        return normalized;
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
            "general" => "G",
            _ => throw new ArgumentException($"Unsupported distribution: {distribution}")
        };
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
}