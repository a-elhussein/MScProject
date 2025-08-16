using System.Security.Claims;
using Backend.Core.Models.DTO;
using Backend.Core.Repositories;
using Backend.Core.WebUtility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers;


[ApiController]
[Route("api/[controller]")]
[Authorize]

public class MacroRecommendationController: ControllerBase
{
    private readonly IMacroRecommendationRepository _macroRecommendationRepository;

    public MacroRecommendationController(IMacroRecommendationRepository macroRecommendationRepository)
    {
        _macroRecommendationRepository = macroRecommendationRepository;
    }
    
    [HttpPost("recommend")]
    public async Task<IActionResult> Recommend([FromBody] MacroRecommendationRequestDto dto)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new ApplicationResponseModel<MacroRecommendationResponseDto>
            {
                Data = null,
                ErrorExist = true,
                ErrorMessage = "Invalid or missing user ID"
            });
        }

        var result = await _macroRecommendationRepository.GenerateRecommendationAsync(userId, dto);

        if (result.ErrorExist)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("trend")]
    public async Task<IActionResult> GetTrends()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new ApplicationResponseModel<List<MacroRecommendationResponseDto>>
            {
                Data = null,
                ErrorExist = true,
                ErrorMessage = "Invalid or missing user ID"
            });
        }

        var result = await _macroRecommendationRepository.GetTrendsAsync(userId);

        if (result.ErrorExist)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("latest")]
    public async Task<IActionResult> GetLatest()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized(new ApplicationResponseModel<MacroRecommendationResponseDto>
            {
                Data = null,
                ErrorExist = true,
                ErrorMessage = "Invalid or missing user ID"
            });
        }
        
        var result = await _macroRecommendationRepository.GetLatestAsync(userId);
        if (result.ErrorExist)
        {
            return NotFound(result);
        } 
        return Ok(result);
    }
    
}