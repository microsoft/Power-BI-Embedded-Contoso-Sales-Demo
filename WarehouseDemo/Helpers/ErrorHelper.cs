// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace WarehouseDemo.Helpers
{
	using Microsoft.Rest;
	using Newtonsoft.Json.Linq;
	using System.Collections.Generic;
	using System.Linq;

	public static class ErrorHelper
	{
		/// <summary>
		/// Extracts error details from the exception
		/// </summary>
		/// <returns>Error details as JSON</returns>
		public static JObject ExtractPowerBiErrorInfo(HttpOperationException ex)
		{
			IEnumerable<string> requestId;
			IEnumerable<string> clusterUri;
			JObject error = JObject.Parse(ex.Response.Content)["error"] as JObject;

			// Extract Request Id from the response header
			ex.Response.Headers.TryGetValue("RequestId", out requestId);

			// Extract Cluster Uri from the response header
			ex.Response.Headers.TryGetValue("home-cluster-uri", out clusterUri);

			// Add extracted values to the error JSON
			if (requestId != null)
			{
				error.Add("requestId", requestId.FirstOrDefault());
			}
			if (clusterUri != null)
			{
				error.Add("clusterUri", clusterUri.FirstOrDefault());
			}

			return error;
		}
	}
}