// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Controllers
{
	using ContosoSalesDemo.Helpers;
	using ContosoSalesDemo.Models;
	using ContosoSalesDemo.Service;
	using Microsoft.AspNetCore.Authorization;
	using Microsoft.AspNetCore.Mvc;
	using Microsoft.Extensions.Caching.Memory;
	using Microsoft.Extensions.Logging;
	using Microsoft.Identity.Client;
	using Microsoft.Rest;
	using Newtonsoft.Json.Linq;
	using System;
	using System.Globalization;
	using System.Net;
	using System.Security.Claims;
	using System.Text.Json;
	using System.Threading.Tasks;

	[ApiController]
	[Route("[controller]")]
	[Authorize(Policy = Constant.GeneralUserPolicyName)]
	public class PowerBiController : ControllerBase
	{
		private readonly EmbedService embedService;
		private readonly ExportService exportService;
		private readonly IMemoryCache cache;
		private readonly ILogger<PowerBiController> logger;
		private readonly CultureInfo cultureInfo = CultureInfo.InvariantCulture;

		public PowerBiController(EmbedService embedService, ExportService exportService, IMemoryCache cache, ILogger<PowerBiController> logger)
		{
			this.embedService = embedService;
			this.exportService = exportService;

			// Get service cache
			this.cache = cache;
			this.logger = logger;
		}

		[HttpPost("/api/powerbi/EmbedParams")]
		public IActionResult GetEmbedParams()
		{
			// Get username and role of user 
			var userInfo = JwtAuthHelper.GetUsernameAndRole(User.Identity as ClaimsIdentity);

			var embedParamsCacheKey = $"{userInfo.username}:{userInfo.role}";

			// Check cache for embed params
			if (cache.TryGetValue(embedParamsCacheKey, out EmbedParams cachedEmbedParams))
			{
				// Parse token
				var embedToken = cachedEmbedParams.EmbedToken.Token;

				// Parse token expiration string
				var tokenExpiry = cachedEmbedParams.EmbedToken.Expiration;

				// Return token from cache if it is still valid
				if (
					!string.IsNullOrWhiteSpace(embedToken) &&
					tokenExpiry.Subtract(DateTime.UtcNow) > TimeSpan.FromMinutes(Constant.RenewBeforeMinutes)
				)
				{
					return Ok(JsonSerializer.Serialize(cachedEmbedParams));
				}
			}

			// Not found in cache or token is close to expiry, generate new embed params
			try
			{
				// Generate Embed token
				var embedParams = embedService.GenerateEmbedParams(userInfo.username, userInfo.role);

				// Create cache options
				var cacheOptions = new MemoryCacheEntryOptions()
					// Keep in cache for this time, reset time if accessed
					.SetSlidingExpiration(TimeSpan.FromDays(Constant.ExpireInDays));

				// Cache the certificate
				cache.Set(embedParamsCacheKey, embedParams, cacheOptions);

				return Ok(JsonSerializer.Serialize(embedParams));
			}
			catch (MsalServiceException ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode(ex.StatusCode, ex.Message);
			}
			catch (MsalClientException ex)
			{
				logger.LogError(ex, ex.Message);
				if (Int32.TryParse(ex.ErrorCode, out int errorCode))
				{
					return StatusCode(errorCode, ex.Message);
				}
				else
				{
					return StatusCode(403, ex.Message);
				}
			}
			catch (HttpOperationException ex)
			{
				logger.LogError(ex, ex.Message);
				JObject error = ErrorHelper.ExtractPowerBiErrorInfo(ex);
				return StatusCode((int)ex.Response.StatusCode, Convert.ToString(error, cultureInfo));
			}
			catch (Exception ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.InternalServerError);
			}
		}

		[HttpPost("/api/powerbi/ExportReport")]
		public async Task<ActionResult<ExportParams>> GetExportedReport([FromBody] ExportParams exportParams)
		{
			if (string.IsNullOrWhiteSpace(exportParams.PageName))
			{
				return BadRequest(Constant.MissingPageName);
			}
			else if (string.IsNullOrWhiteSpace(exportParams.FileFormat))
			{
				return BadRequest(Constant.MissingFileFormat);
			}

			try
			{
				// Get username and role of user 
				var userInfo = JwtAuthHelper.GetUsernameAndRole(User.Identity as ClaimsIdentity);

				// Generated exported file
				var exportedFile = await exportService.GetExportedFile(exportParams.PageName, exportParams.FileFormat, exportParams.PageState, userInfo.username, userInfo.role);

				return Ok(File(exportedFile.MemoryStream.ToArray(), exportedFile.MimeType, exportedFile.FileName));
			}
			catch (MsalServiceException ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode(ex.StatusCode, ex.Message);
			}
			catch (MsalClientException ex)
			{
				logger.LogError(ex, ex.Message);
				if (Int32.TryParse(ex.ErrorCode, out int errorCode))
				{
					return StatusCode(errorCode, ex.Message);
				}
				else
				{
					return StatusCode(403, ex.Message);
				}
			}
			catch (HttpOperationException ex)
			{
				logger.LogError(ex, ex.Message);
				JObject error = ErrorHelper.ExtractPowerBiErrorInfo(ex);
				return StatusCode((int)ex.Response.StatusCode, Convert.ToString(error, cultureInfo));
			}
			catch (Exception ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.InternalServerError);
			}
		}
	}
}
