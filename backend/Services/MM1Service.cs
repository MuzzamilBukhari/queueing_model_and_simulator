using QueueSimulatorAPI.Models;

namespace QueueSimulatorAPI.Services;

public class MM1Service
{
    public MM1Response Calculate(double meanInterarrivalTime, double meanServiceTime)
    {
        // Step 1: Validate inputs
        if (meanInterarrivalTime <= 0)
            throw new ArgumentException("Mean Interarrival Time must be greater than 0");
        
        if (meanServiceTime <= 0)
            throw new ArgumentException("Mean Service Time must be greater than 0");

        // Step 2: Convert times to rates
        double lambda = 1.0 / meanInterarrivalTime;
        double mu = 1.0 / meanServiceTime;

        // Step 3: Calculate utilization (ρ)
        double rho = lambda / mu;

        // Step 4: Check system stability
        if (rho >= 1.0)
            throw new InvalidOperationException("System unstable. Utilization (ρ) must be less than 1.");

        // Step 5: Calculate queueing metrics using exact formulas
        double lq = (rho * rho) / (1 - rho);           // Average number in queue
        double wq = lq / lambda;                        // Average time in queue
        double w = wq + (1.0 / mu);                     // Average time in system
        double l = lambda * w;                          // Average number in system
        double idleProbability = 1 - rho;               // Probability system is idle

        // Step 6: Return response
        return new MM1Response
        {
            Lambda = lambda,
            Mu = mu,
            Rho = rho,
            Lq = lq,
            Wq = wq,
            W = w,
            L = l,
            IdleProbability = idleProbability
        };
    }
}
