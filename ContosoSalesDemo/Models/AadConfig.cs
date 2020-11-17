// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Models
{
	public class AadConfig
	{
		// Client Id (Application Id) of the AAD app
		public string ClientId { get; set; }

		// Id of the Azure tenant in which AAD app is hosted
		public string TenantId { get; set; }
	}
}