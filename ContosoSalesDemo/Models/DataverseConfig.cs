// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Models
{
	public class DataverseConfig
	{
		// Scope of Dataverse used while fetching AAD Token
		public string Scope { get; set; }

		// API Base URL of Dataverse
		public string ApiBaseUrl { get; set; }
	}
}