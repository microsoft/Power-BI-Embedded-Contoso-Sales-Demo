// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

namespace WarehouseDemo.Service
{
	using Microsoft.Extensions.Options;
	using Microsoft.Identity.Client;
	using System;
	using System.Security.Cryptography.X509Certificates;
	using System.Threading.Tasks;
	using WarehouseDemo.Models;

	public class AuthService
	{
		private IOptions<AuthConfig> AuthConfig { get; set; }
		private static string aadToken;
		private static DateTime tokenExpiry;

		public AuthService(IOptions<AuthConfig> authConfig)
		{
			AuthConfig = authConfig;
		}

		/// <summary>
		/// Return Azure Active Directory token
		/// </summary>
		/// <returns>Azure Active Directory token</returns>
		public async Task<string> GetAadToken(string base64Certificate)
		{
			// Generate token if it is not present or near expiry
			if (string.IsNullOrEmpty(aadToken) || tokenExpiry.Subtract(DateTime.UtcNow) <= TimeSpan.FromMinutes(Constant.RenewBeforeMinutes))
			{
				await GenerateAadToken(base64Certificate);
			}
			return aadToken;
		}

		/// <summary>
		/// Generate Azure Active Directory token
		/// </summary>
		/// <returns></returns>
		private async Task GenerateAadToken(string base64Certificate)
		{
			var clientCertificate = new X509Certificate2(Convert.FromBase64String(base64Certificate), string.Empty, X509KeyStorageFlags.MachineKeySet);
			var authorityUrl = $"https://login.microsoftonline.com/{AuthConfig.Value.TenantId}";
			var scope = new string[] { "https://analysis.windows.net/powerbi/api/.default" };

			IConfidentialClientApplication clientApp = ConfidentialClientApplicationBuilder
																			.Create(AuthConfig.Value.ClientId)
																			.WithCertificate(clientCertificate)
																			.WithAuthority(authorityUrl)
																			.Build();
 
			var authenticationResult = await clientApp.AcquireTokenForClient(scope).ExecuteAsync();
			aadToken = authenticationResult.AccessToken;
			tokenExpiry = authenticationResult.ExpiresOn.DateTime;
		}
	}
}
