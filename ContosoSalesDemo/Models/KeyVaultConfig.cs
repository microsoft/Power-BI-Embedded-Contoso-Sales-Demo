// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Models
{
	public class KeyVaultConfig
	{
		// Name of certificate present in Key Vault
		public string CertificateName { get; set; }

		// Name of the Key Vault
		public string KeyVaultName { get; set; }

		// Name of the RSA key present in the Key Vault
		public string KeyName { get; set; }

		// Version of the RSA key
		public string KeyVersion { get; set; }
	}
}