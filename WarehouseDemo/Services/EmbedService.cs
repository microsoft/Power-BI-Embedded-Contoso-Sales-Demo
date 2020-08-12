// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

namespace WarehouseDemo.Service
{
	using Microsoft.PowerBI.Api;
	using Microsoft.PowerBI.Api.Models;
	using Microsoft.Rest;
	using Newtonsoft.Json.Linq;
	using System;
	using System.Collections.Generic;

	public class EmbedService
	{
		private TokenCredentials tokenCredentials;

		public EmbedService(string aadToken)
		{
			tokenCredentials = new TokenCredentials(aadToken, "Bearer");
		}

		/// <summary>
		/// Generate Embed token and Embed URL
		/// </summary>
		/// <returns></returns>
		public JObject GenerateEmbedParams(Guid workspaceId, Guid reportId, string username = null, string role = null)
		{
			using (var pbiClient = new PowerBIClient(new Uri(Constant.PowerBiApiUri), tokenCredentials))
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
				// TODO: Uncomment below 4 lines when RLS is implemented in report
				// if (!string.IsNullOrWhiteSpace(username) || !string.IsNullOrWhiteSpace(role))
				// {
				// 	identities = new List<EffectiveIdentity> { new EffectiveIdentity(username: username, roles: new List<string> { role }, datasets: new List<string> { pbiReport.DatasetId }) };
				// }

				// Create a request for getting Embed token 
				var tokenRequest = new GenerateTokenRequestV2(datasets: datasets, reports: reports, targetWorkspaces: workspaces, identities: identities);

				// Get Embed token
				var embedToken = pbiClient.EmbedToken.GenerateToken(tokenRequest);

				// Capture embed parameters
				var embedParams = new JObject
				{
					{ "Id", pbiReport.Id.ToString() },
					{ "EmbedUrl", pbiReport.EmbedUrl },
					{ "Type", "report" },
					{ "EmbedToken", new JObject {
							{ "Token", embedToken.Token },
							{ "TokenId", embedToken.TokenId },
							{ "Expiration", embedToken.Expiration.ToString() }
						}
					},
					{ "DefaultPage", null },
					{ "MobileDefaultPage", null }
				};

				return embedParams;
			}
		}
	}
}
