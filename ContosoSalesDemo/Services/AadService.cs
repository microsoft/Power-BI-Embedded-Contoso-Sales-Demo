// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Service
{
	using Microsoft.Extensions.Options;
	using Microsoft.Identity.Client;
	using System;
	using System.Security.Cryptography.X509Certificates;
	using System.Threading.Tasks;
	using ContosoSalesDemo.Models;

	public class AadService
	{
		/// <summary>
		/// Get Azure Active Directory token
		/// </summary>
		/// <returns>Azure Active Directory token</returns>
		public static async Task<string> GetAadToken(string base64Certificate, IOptions<AadConfig> AadConfig, string[] scope)
		{
			var clientCertificate = new X509Certificate2(Convert.FromBase64String(base64Certificate), string.Empty, X509KeyStorageFlags.MachineKeySet);
			var authorityUrl = $"https://login.microsoftonline.com/{AadConfig.Value.TenantId}";

			IConfidentialClientApplication clientApp = ConfidentialClientApplicationBuilder
																			.Create(AadConfig.Value.ClientId)
																			.WithCertificate(clientCertificate)
																			.WithAuthority(authorityUrl)
																			.Build();

			// Initialize cache to save AAD Token
			new MSALMemoryTokenCache(clientApp.AppTokenCache);
			AuthenticationResult authenticationResult = await clientApp.AcquireTokenForClient(scope).ExecuteAsync();

			// Get tokenExpiry to check if near expiration
			var tokenExpiry = authenticationResult.ExpiresOn.DateTime;

			// Refresh the AAD token when near expiration
			if (tokenExpiry.Subtract(DateTime.UtcNow) <= TimeSpan.FromMinutes(Constant.RenewBeforeMinutes))
			{
				authenticationResult = await clientApp.AcquireTokenForClient(scope).WithForceRefresh(true).ExecuteAsync();
			}

			// Get the AAD token from the result
			var aadToken = authenticationResult.AccessToken;
			return aadToken;
		}
	}
}