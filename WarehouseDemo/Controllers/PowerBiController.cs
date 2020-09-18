// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace WarehouseDemo.Controllers
{
	using Microsoft.AspNetCore.Authorization;
	using Microsoft.AspNetCore.Mvc;
	using Microsoft.Extensions.Caching.Memory;
	using Microsoft.Extensions.Configuration;
	using Microsoft.Extensions.Logging;
	using Microsoft.Extensions.Options;
	using Microsoft.Identity.Client;
	using Microsoft.Identity.Web;
	using Microsoft.Rest;
	using Newtonsoft.Json.Linq;
	using System;
	using System.Net;
	using System.Security.Claims;
	using System.Threading.Tasks;
	using WarehouseDemo.Helpers;
	using WarehouseDemo.Models;
	using WarehouseDemo.Service;

	[ApiController]
	[Route("[controller]")]
	[Authorize(Policy = Constant.GeneralUserPolicyName)]
	public class PowerBiController : ControllerBase
	{
		private readonly ITokenAcquisition TokenAcquisition;
		private static IConfiguration Configuration { get; set; }
		private static IOptions<PowerBiConfig> PowerBiConfig { get; set; }
		private IMemoryCache Cache { get; set; }
		private readonly ILogger<PowerBiController> Logger;

		public PowerBiController(IConfiguration configuration, ITokenAcquisition tokenAcquisition, IOptions<PowerBiConfig> powerBiConfig, IMemoryCache cache, ILogger<PowerBiController> logger)
		{
			Configuration = configuration;
			TokenAcquisition = tokenAcquisition;
			PowerBiConfig = powerBiConfig;

			// Get service cache
			Cache = cache;
			Logger = logger;
		}

		[HttpPost("/api/powerbi/EmbedParams")]
		public async Task<IActionResult> GetEmbedParams()
		{
			// TODO: Add throttling by IP on this API

			// Get username and role of user 
			var userInfo = JwtAuthHelper.GetUsernameAndRole(User.Identity as ClaimsIdentity);

			var embedParamsCacheKey = $"{userInfo.username}:{userInfo.role}";

			// Check cache for embed params
			if (Cache.TryGetValue(embedParamsCacheKey, out JObject cachedEmbedParams))
			{
				// Parse token
				var embedToken = (string) cachedEmbedParams.SelectToken("EmbedToken.Token");

				// Parse token expiration string
				var tokenExpiryString = (string) cachedEmbedParams.SelectToken("EmbedToken.Expiration");

				// Parse to expiration DateTime and update tokenExpiry
				if (DateTime.TryParse(tokenExpiryString, out var tokenExpiry))
				{
					// Return token from cache if it is still valid
					if (
						!string.IsNullOrWhiteSpace(embedToken) && 
						tokenExpiry.Subtract(DateTime.UtcNow) > TimeSpan.FromMinutes(Constant.RenewBeforeMinutes)
					)
					{
						return Ok(cachedEmbedParams.ToString());
					}
				}
			}

			// Not found in cache or token is close to expiry, generate new embed params
			try
			{
				// Get AAD token. This request will check memory cache first
				var aadToken = await TokenAcquisition.GetAccessTokenForAppAsync(new string[] { Constant.PowerBiScope });

				// Generate Embed token
				var embedService = new EmbedService(aadToken);
				var embedParams = embedService.GenerateEmbedParams(new Guid(PowerBiConfig.Value.WorkspaceId), new Guid(PowerBiConfig.Value.ReportId), userInfo.username, userInfo.role);

				// Create cache options
				var cacheOptions = new MemoryCacheEntryOptions()
					// Keep in cache for this time, reset time if accessed
					.SetSlidingExpiration(TimeSpan.FromDays(Constant.ExpireInDays));

				// Cache the certificate
				Cache.Set(embedParamsCacheKey, embedParams, cacheOptions);

				return Ok(embedParams.ToString());
			}
			catch (MsalServiceException ex)
			{
				Logger.LogError(ex, ex.Message);
				return StatusCode(ex.StatusCode, ex.Message);
			}
			catch (MsalClientException ex)
			{
				Logger.LogError(ex, ex.Message);
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
				Logger.LogError(ex, ex.Message);
				JObject error = ErrorHelper.ExtractPowerBiErrorInfo(ex);
				return StatusCode((int)ex.Response.StatusCode, error.ToString());
			}
			catch (Exception ex)
			{
				Logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.InternalServerError);
			}
		}

		[HttpPost("/api/powerbi/ExportReport")]
		public async Task<ActionResult<ExportParams>> GetExportedReport([FromBody] ExportParams exportParams)
		{
			// TODO: Add throttling by IP on this API

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
				// Get AAD token. This request will check memory cache first
				var aadToken = await TokenAcquisition.GetAccessTokenForAppAsync(new string[] { Constant.PowerBiScope });

				// Get username and role of user 
				var userInfo = JwtAuthHelper.GetUsernameAndRole(User.Identity as ClaimsIdentity);

				// Generated exported file
				var exportService = new ExportService(aadToken);
				var exportedFile = await exportService.GetExportedFile(new Guid(PowerBiConfig.Value.WorkspaceId), new Guid(PowerBiConfig.Value.ReportId), exportParams.PageName, exportParams.FileFormat, exportParams.PageState, userInfo.username, userInfo.role);

				return Ok(File(exportedFile.MemoryStream.ToArray(), exportedFile.MimeType, exportedFile.FileName));
			}
			catch (MsalServiceException ex)
			{
				Logger.LogError(ex, ex.Message);
				return StatusCode(ex.StatusCode, ex.Message);
			}
			catch (MsalClientException ex)
			{
				Logger.LogError(ex, ex.Message);
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
				Logger.LogError(ex, ex.Message);
				JObject error = ErrorHelper.ExtractPowerBiErrorInfo(ex);
				return StatusCode((int)ex.Response.StatusCode, error.ToString());
			}
			catch (Exception ex)
			{
				Logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.InternalServerError);
			}
		}
	}
}
