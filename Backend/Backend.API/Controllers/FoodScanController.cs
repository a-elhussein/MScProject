using System.Security.Claims;
using Backend.Core.Models.DTO;
using Backend.Core.Services;
using Backend.Core.WebUtility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FoodScanController : ControllerBase
    {
        private readonly IOpenFoodFactsService _openFoodFactsService;

        public FoodScanController(IOpenFoodFactsService openFoodFactsService)
        {
            _openFoodFactsService = openFoodFactsService;
        }

        [HttpPost]
        [Route("impact")]
        public async Task<IActionResult> Impact([FromBody] FoodScanRequestDto dto)
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            {
                return Unauthorized(new ApplicationResponseModel<FoodMacroImpactResponseDto>
                {
                    Data = null,
                    ErrorExist = true,
                    ErrorMessage = "Invalid or missing user ID"
                });
            }
            
            if (string.IsNullOrWhiteSpace(dto.Barcode))
            {
                return BadRequest(new ApplicationResponseModel<FoodMacroImpactResponseDto>
                {
                    Data = null,
                    ErrorExist = true,
                    ErrorMessage = "Barcode is required"
                });
            }

            if (dto.Quantity <= 0)
            {
                return BadRequest(new ApplicationResponseModel<FoodMacroImpactResponseDto>
                {
                    Data = null,
                    ErrorExist = true,
                    ErrorMessage = "Quantity must be greater than zero"
                });
            }
            
            dto.Unit = (dto.Unit ?? "100g").Trim().ToLowerInvariant();
            if (dto.Unit != "serving" && dto.Unit != "100g" && dto.Unit != "1g")
                dto.Unit = "100g";
            var result = await _openFoodFactsService.GetFoodMacroImpactAsync(dto, userId);

            if (result.ErrorExist) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost]
        [Route("refresh/{barcode}")]
        public async Task<IActionResult> Refresh(string barcode)
        {
            if (string.IsNullOrWhiteSpace(barcode))
                return BadRequest(new ApplicationResponseModel<string>
                {
                    ErrorExist = true,
                    ErrorMessage = "Barcode is required."
                });

            var result = await _openFoodFactsService.RefreshFoodAsync(barcode);
            return result.ErrorExist ? BadRequest(result) : Ok(result);
        }
        
        [HttpGet]
        [Route("{barcode}")]
        public async Task<IActionResult> Get(string barcode)
        {
            if (string.IsNullOrWhiteSpace(barcode))
                return BadRequest(new ApplicationResponseModel<string>
                {
                    ErrorExist = true,
                    ErrorMessage = "Barcode is required."
                });

            var result = await _openFoodFactsService.RefreshFoodAsync(barcode);
            return result.ErrorExist ? BadRequest(result) : Ok(result);
        }
    }
}