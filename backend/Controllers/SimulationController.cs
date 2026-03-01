using Microsoft.AspNetCore.Mvc;
using QueueSimulatorAPI.Models;
using QueueSimulatorAPI.Services;

namespace QueueSimulatorAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SimulationController : ControllerBase
{
    private readonly MM1Service _mm1Service;

    public SimulationController(MM1Service mm1Service)
    {
        _mm1Service = mm1Service;
    }

    /// <summary>
    /// Calculate M/M/1 queueing model metrics
    /// </summary>
    /// <param name="request">Mean interarrival and service times</param>
    /// <returns>Queueing metrics (λ, μ, ρ, Lq, Wq, W, L, Idle Probability)</returns>
    [HttpPost("mm1")]
    [ProducesResponseType(typeof(MM1Response), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult CalculateMM1([FromBody] MM1Request request)
    {
        // Validate model state
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // Calculate M/M/1 metrics
            var response = _mm1Service.Calculate(
                request.MeanInterarrivalTime, 
                request.MeanServiceTime
            );

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            // System unstable (ρ >= 1)
            return BadRequest(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            // Invalid input parameters
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            // Unexpected error
            return StatusCode(500, new { error = "An unexpected error occurred", details = ex.Message });
        }
    }
}
