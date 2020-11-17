// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Models
{
	public class CdsConfig
	{
		// Scope of CDS used while fetching AAD Token
		public string Scope { get; set; }

		// API Base URL of CDS
		public string ApiBaseUrl { get; set; }
	}
}