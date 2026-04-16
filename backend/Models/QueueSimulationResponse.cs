namespace QueueSimulatorAPI.Models;

public class QueueSimulationResponse
{
    public string Model { get; set; } = string.Empty;
    public double Rho { get; set; }
    public double L { get; set; }
    public double Lq { get; set; }
    public double W { get; set; }
    public double Wq { get; set; }
    public double? P0 { get; set; }
}