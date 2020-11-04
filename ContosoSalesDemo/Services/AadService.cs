// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Service
{
	using ContosoSalesDemo.Models;
	using Microsoft.Extensions.Configuration;
	using Microsoft.Extensions.Options;
	using Microsoft.Identity.Client;
	using System;
	using System.Security.Cryptography.X509Certificates;
	using System.Threading.Tasks;

	public class AadService
	{
		private readonly string base64Certificate;
		private readonly IOptions<AadConfig> aadConfig;

		public AadService(IConfiguration configuration, IOptions<AadConfig> aadConfig, IOptions<KeyVaultConfig> keyVaultConfig, IOptions<CdsConfig> cdsConfig)
		{
			this.base64Certificate = configuration[keyVaultConfig.Value.CertificateName];
			this.aadConfig = aadConfig;
		}

		/// <summary>
		/// Get Azure Active Directory token
		/// </summary>
		/// <returns>Azure Active Directory token</returns>
		public async Task<string> GetAadToken(string[] scopes)
		{
			var clientCertificate = new X509Certificate2(Convert.FromBase64String(base64Certificate), string.Empty, X509KeyStorageFlags.MachineKeySet);
			var authorityUrl = $"https://login.microsoftonline.com/{aadConfig.Value.TenantId}";

			IConfidentialClientApplication clientApp = ConfidentialClientApplicationBuilder
																			.Create(aadConfig.Value.ClientId)
																			.WithCertificate(clientCertificate)
																			.WithAuthority(authorityUrl)
																			.Build();

			// Initialize cache to save AAD Token
			new MSALMemoryTokenCache(clientApp.AppTokenCache);
			AuthenticationResult authenticationResult = await clientApp.AcquireTokenForClient(scopes).ExecuteAsync();

			// Get tokenExpiry to check if near expiration
			var tokenExpiry = authenticationResult.ExpiresOn.DateTime;

			// Refresh the AAD token when near expiration
			if (tokenExpiry.Subtract(DateTime.UtcNow) <= TimeSpan.FromMinutes(Constant.RenewBeforeMinutes))
			{
				authenticationResult = await clientApp.AcquireTokenForClient(scopes).WithForceRefresh(true).ExecuteAsync();
			}

			// Get the AAD token from the result
			var aadToken = authenticationResult.AccessToken;
			return aadToken;
		}
	}
}