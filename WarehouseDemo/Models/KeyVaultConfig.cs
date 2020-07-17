// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

namespace WarehouseDemo.Models
{
	public class KeyVaultConfig
	{
		// Name of the Azure Key Vault in which certificate is present
		public string KeyVaultName { get; set; }

		// Name of certificate to be used for authentication
		public string CertificateName { get; set; }
	}
}
