// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Service
{
	using ContosoSalesDemo.Models;
	using Microsoft.Extensions.Options;
	using Microsoft.PowerBI.Api;
	using Microsoft.PowerBI.Api.Models;
	using Microsoft.Rest;
	using System;
	using System.Collections.Generic;
	using System.Threading.Tasks;

	public class EmbedService
	{
		private readonly AadService aadService;
		private readonly Guid workspaceId;
		private readonly Guid reportId;
		private readonly PowerBIClient pbiClient;

		public EmbedService(AadService aadService, IOptions<PowerBiConfig> powerBiConfig)
		{
			this.aadService = aadService;
			this.workspaceId = new Guid(powerBiConfig.Value.WorkspaceId);
			this.reportId = new Guid(powerBiConfig.Value.ReportId);
			this.pbiClient = GetPowerBIClientAsync().Result;
		}

		/// <summary>
		/// Generate Power BI client object
		/// </summary>
		/// <returns>Power BI client object</returns>
		private async Task<PowerBIClient> GetPowerBIClientAsync()
		{
			var aadToken = await aadService.GetAadToken(new string[] { Constant.PowerBiScope });
			var tokenCredentials = new TokenCredentials(aadToken, "Bearer");
			var pbiClient = new PowerBIClient(new Uri(Constant.PowerBiApiUri), tokenCredentials);
			return pbiClient;
		}

		/// <summary>
		/// Generate Embed token and Embed URL
		/// </summary>
		/// <returns></returns>
		public EmbedParams GenerateEmbedParams(string username = null, string role = null)
		{
			// Get report info
			var pbiReport = pbiClient.Reports.GetReportInGroup(workspaceId, reportId);

			// Create list of datasets
			var datasets = new GenerateTokenRequestV2Dataset[] { new GenerateTokenRequestV2Dataset(pbiReport.DatasetId) };

			// Create list of reports
			var reports = new GenerateTokenRequestV2Report[] { new GenerateTokenRequestV2Report(reportId) };

			// Create list of workspaces
			var workspaces = new GenerateTokenRequestV2TargetWorkspace[] { new GenerateTokenRequestV2TargetWorkspace(workspaceId) };

			// Create effective identity for current user
			List<EffectiveIdentity> identities = null;

			if (!string.IsNullOrWhiteSpace(username) || !string.IsNullOrWhiteSpace(role))
			{
				identities = new List<EffectiveIdentity> { new EffectiveIdentity(username: username, roles: new List<string> { role }, datasets: new List<string> { pbiReport.DatasetId }) };
			}

			// Create a request for getting Embed token
			var tokenRequest = new GenerateTokenRequestV2(datasets: datasets, reports: reports, targetWorkspaces: workspaces, identities: identities);

			// Get Embed token
			var embedToken = pbiClient.EmbedToken.GenerateToken(tokenRequest);

			// Capture embed parameters
			var embedParams = new EmbedParams
			{
				Id = pbiReport.Id,
				EmbedUrl = pbiReport.EmbedUrl,
				Type = "report",
				EmbedToken = new EmbedToken
				{
					Token = embedToken.Token,
					TokenId = embedToken.TokenId,
					Expiration = embedToken.Expiration
				},
				DefaultPage = null
			};

			return embedParams;
		}
	}
}
