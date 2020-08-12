// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

namespace WarehouseDemo.Controllers
{
	using Microsoft.AspNetCore.Mvc;
	using Microsoft.Extensions.Caching.Memory;
	using Microsoft.Extensions.Configuration;
	using Microsoft.Extensions.Options;
	using Microsoft.Identity.Client;
	using Microsoft.Rest;
	using Newtonsoft.Json.Linq;
	using System;
	using System.Security.Claims;
	using System.Threading.Tasks;
	using WarehouseDemo.Helpers;
	using WarehouseDemo.Models;
	using WarehouseDemo.Service;

	[ApiController]
	[Route("[controller]")]
	public class PowerBiController : ControllerBase
	{
		private static IConfiguration Configuration { get; set; }
		private static IOptions<AuthConfig> AuthConfig { get; set; }
		private static IOptions<PowerBiConfig> PowerBiConfig { get; set; }
		private IMemoryCache Cache { get; set; }

		public PowerBiController(IConfiguration configuration, IOptions<AuthConfig> authConfig, IOptions<PowerBiConfig> powerBiConfig, IMemoryCache cache)
		{
			Configuration = configuration;
			AuthConfig = authConfig;
			PowerBiConfig = powerBiConfig;

			// Get service cache
			Cache = cache;
		}

		[HttpPost("/api/powerbi/EmbedParams")]
		public async Task<IActionResult> GetEmbedParams()
		{
			// TODO: Add throttling by IP on this API

			try
			{
				// Generate AAD token
				var authService = new AuthService(AuthConfig);
				var aadToken = await authService.GetAadToken(Configuration[Constant.Certificate]);

				// Get username and role of user 
				var userInfo = JwtAuthHelper.GetUsernameAndRole(User.Identity as ClaimsIdentity);

				// Generate Embed token
				var embedService = new EmbedService(aadToken);
				var embedParams = embedService.GenerateEmbedParams(new Guid(PowerBiConfig.Value.WorkspaceId), new Guid(PowerBiConfig.Value.ReportId), userInfo.username, userInfo.role);

				return Ok(embedParams.ToString());
			}
			catch (MsalServiceException ex)
			{
				return StatusCode(ex.StatusCode, ex.Message);
			}
			catch (MsalClientException ex)
			{
				return StatusCode(int.Parse(ex.ErrorCode), ex.Message);
			}
			catch (HttpOperationException ex)
			{
				JObject error = ErrorHelper.ExtractPowerBiErrorInfo(ex);
				return StatusCode((int)ex.Response.StatusCode, error.ToString());
			}
			catch (Exception ex)
			{
				return StatusCode(500, ex.Message);
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
				// Generate AAD token
				var authService = new AuthService(AuthConfig);
				var aadToken = await authService.GetAadToken(Configuration[Constant.Certificate]);

				// Get username and role of user 
				var userInfo = JwtAuthHelper.GetUsernameAndRole(User.Identity as ClaimsIdentity);

				// Generated exported file
				var exportService = new ExportService(aadToken);
				var exportedFile = await exportService.GetExportedFile(new Guid(PowerBiConfig.Value.WorkspaceId), new Guid(PowerBiConfig.Value.ReportId), exportParams.PageName, exportParams.FileFormat, exportParams.PageState, userInfo.username, userInfo.role);

				return Ok(File(exportedFile.MemoryStream.ToArray(), exportedFile.MimeType, exportedFile.FileName));
			}
			catch (MsalServiceException ex)
			{
				return StatusCode(ex.StatusCode, ex.Message);
			}
			catch (MsalClientException ex)
			{
				return StatusCode(int.Parse(ex.ErrorCode), ex.Message);
			}
			catch (HttpOperationException ex)
			{
				JObject error = ErrorHelper.ExtractPowerBiErrorInfo(ex);
				return StatusCode((int)ex.Response.StatusCode, error.ToString());
			}
			catch (Exception ex)
			{
				return StatusCode(500, ex.Message);
			}
		}
	}
}
