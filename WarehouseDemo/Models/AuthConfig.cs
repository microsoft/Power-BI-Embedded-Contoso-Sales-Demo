// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

namespace WarehouseDemo.Models
{
	public class AuthConfig
	{
		// Client Id (Application Id) of the AAD app
		public string ClientId { get; set; }

		// Id of the Azure tenant in which AAD app is hosted
		public string TenantId { get; set; }
	}
}
