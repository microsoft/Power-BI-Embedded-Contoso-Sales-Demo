// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

namespace WarehouseDemo.Controllers
{
	using Microsoft.AspNetCore.Mvc;
	using Microsoft.Extensions.Caching.Memory;
	using Microsoft.Extensions.Options;
	using System;
	using System.Threading.Tasks;
	using WarehouseDemo.Models;
	using WarehouseDemo.Service;

	[ApiController]
	[Route("[controller]")]
	public class PowerBiController : ControllerBase
	{
		private static IOptions<KeyVaultConfig> KeyVaultConfig { get; set; }
		private static IOptions<AuthConfig> AuthConfig { get; set; }
		private static IOptions<PowerBiConfig> PowerBiConfig { get; set; }
		private IMemoryCache Cache { get; set; }

		public PowerBiController(IOptions<KeyVaultConfig> keyVaultConfig, IOptions<AuthConfig> authConfig, IOptions<PowerBiConfig> powerBiConfig, IMemoryCache cache)
		{
			KeyVaultConfig = keyVaultConfig;
			AuthConfig = authConfig;
			PowerBiConfig = powerBiConfig;

			// Get service cache
			Cache = cache;
		}

		[HttpPost("/api/powerbi/EmbedParams")]
		public async Task<IActionResult> GetEmbedParams()
		{
			// TODO: Extract JWT token from request header
			// TODO: Add throttling by IP on this API

			// Generate AAD token
			var authService = new AuthService(KeyVaultConfig, AuthConfig, Cache);
			var aadToken = await authService.GetAadToken();

			// Generate Embed token
			var embedService = new EmbedService(aadToken);
			var embedParams = embedService.GenerateEmbedParams(new Guid(PowerBiConfig.Value.WorkspaceId), new Guid(PowerBiConfig.Value.ReportId));

			return Ok(embedParams.ToString());
		}

		[HttpPost("/api/powerbi/ExportReport")]
		public async Task<ActionResult<ExportParams>> GetExportedReport([FromBody] ExportParams exportParams)
		{
			// TODO: Extract JWT token from request header
			// TODO: Add throttling by IP on this API

			if (string.IsNullOrWhiteSpace(exportParams.PageName))
			{
				return BadRequest(Constant.MissingPageName);
			}
			else if (string.IsNullOrWhiteSpace(exportParams.FileFormat))
			{
				return BadRequest(Constant.MissingFileFormat);
			}

			// Generate AAD token
			var authService = new AuthService(KeyVaultConfig, AuthConfig, Cache);
			var aadToken = await authService.GetAadToken();

			// Generated exported file
			var exportService = new ExportService(aadToken);
			var exportedFile = await exportService.GetExportedFile(new Guid(PowerBiConfig.Value.WorkspaceId), new Guid(PowerBiConfig.Value.ReportId), exportParams.PageName, exportParams.FileFormat, exportParams.PageState);

			return Ok(File(exportedFile.MemoryStream.ToArray(), exportedFile.MimeType, exportedFile.FileName));
		}
	}
}
