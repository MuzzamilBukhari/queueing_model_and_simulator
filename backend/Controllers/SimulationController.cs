using Microsoft.AspNetCore.Mvc;
using QueueSimulatorAPI.Models;
using QueueSimulatorAPI.Services;

namespace QueueSimulatorAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SimulationController : ControllerBase
{
    private readonly QueueModelService _queueModelService;
    private readonly MM1SimulatorService _mm1SimulatorService;

    public SimulationController(
        QueueModelService queueModelService,
        MM1SimulatorService mm1SimulatorService)
    {
        _queueModelService = queueModelService;
        _mm1SimulatorService = mm1SimulatorService;
    }

    /// <summary>
    /// Calculate queueing model metrics (manual or auto-detection)
    /// </summary>
    /// <param name="request">Generic queueing request payload</param>
    /// <returns>Queueing metrics (rho, L, Lq, W, Wq, optional P0)</returns>
    [HttpPost("calculate")]
    [ProducesResponseType(typeof(QueueSimulationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult Calculate([FromBody] QueueSimulationRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var response = _queueModelService.Calculate(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An unexpected error occurred", details = ex.Message });
        }
    }

    /// <summary>
    /// Discrete-event M/M/1 simulator: generates N customers using Poisson arrivals
    /// and exponential service times, returns the full trace table + Gantt segments
    /// + aggregate performance measures.
    /// </summary>
    [HttpPost("mm1/simulate")]
    [ProducesResponseType(typeof(SimulationTraceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult SimulateMM1([FromBody] SimulationTraceRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var response = _mm1SimulatorService.Simulate(request);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An unexpected error occurred", details = ex.Message });
        }
    }

    /// <summary>
    /// Backward-compatible endpoint for M/M/1 payload used by existing clients
    /// </summary>
    [HttpPost("mm1")]
    [ProducesResponseType(typeof(QueueSimulationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public IActionResult CalculateMM1([FromBody] MM1Request request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var genericRequest = new QueueSimulationRequest
        {
            Model = "M/M/1",
            AutoDetectModel = false,
            MeanInterArrivalTime = request.MeanInterarrivalTime,
            ServiceTime = request.MeanServiceTime,
            Servers = 1
        };

        return Calculate(genericRequest);
    }
}
