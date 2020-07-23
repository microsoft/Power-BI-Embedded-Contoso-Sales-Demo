// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

namespace WarehouseDemo.Service
{
	using Microsoft.Azure.KeyVault;
	using Microsoft.Azure.Services.AppAuthentication;
	using Microsoft.Extensions.Caching.Memory;
	using Microsoft.Extensions.Options;
	using Microsoft.Identity.Client;
	using System;
	using System.Security.Cryptography.X509Certificates;
	using System.Threading.Tasks;
	using WarehouseDemo.Models;

	public class AuthService
	{
		private IMemoryCache Cache { get; set; }
		private IOptions<KeyVaultConfig> KeyVaultConfig { get; set; }
		private IOptions<AuthConfig> AuthConfig { get; set; }
		private static string aadToken;
		private static DateTime tokenExpiry;

		public AuthService(IOptions<KeyVaultConfig> keyVaultConfig, IOptions<AuthConfig> authConfig, IMemoryCache cache)
		{
			KeyVaultConfig = keyVaultConfig;
			AuthConfig = authConfig;
			Cache = cache;
		}

		/// <summary>
		/// Return Azure Active Directory token
		/// </summary>
		/// <returns>Azure Active Directory token</returns>
		public async Task<string> GetAadToken()
		{
			// Generate token if it is not present or near expiry
			if (string.IsNullOrEmpty(aadToken) || tokenExpiry.Subtract(DateTime.UtcNow) <= TimeSpan.FromMinutes(Constant.RenewBeforeMinutes))
			{
				await GenerateAadToken();
			}
			return aadToken;
		}

		/// <summary>
		/// Generate Azure Active Directory token
		/// </summary>
		/// <returns></returns>
		private async Task GenerateAadToken()
		{
			// Retrieve certificate from Azure Key Vault using Managed Service Identity
			var clientCertificate = await ReadCertificateFromVault();

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

		/// <summary>
		/// Get certificate from Azure Key Vault
		/// </summary>
		/// <returns>X509Certificate2 certificate</returns>
		private async Task<X509Certificate2> ReadCertificateFromVault()
		{
			X509Certificate2 x509Certificate;

			// Check whether certificate is present in cache
			if (Cache.TryGetValue(Constant.Certificate, out x509Certificate))
			{
				return x509Certificate;
			}

			var serviceTokenProvider = new AzureServiceTokenProvider();
			var keyVaultClient = new KeyVaultClient(new KeyVaultClient.AuthenticationCallback(serviceTokenProvider.KeyVaultTokenCallback));

			try
			{
				var certificate = await keyVaultClient.GetCertificateAsync($"https://{KeyVaultConfig.Value.KeyVaultName}.vault.azure.net/", KeyVaultConfig.Value.CertificateName);
				var secret = await keyVaultClient.GetSecretAsync(certificate.SecretIdentifier.Identifier);
				
				// MachineKeySet flag is required by Azure Web app
				x509Certificate = new X509Certificate2(Convert.FromBase64String(secret.Value), string.Empty, X509KeyStorageFlags.MachineKeySet);

				// Create cache options
				var cacheOptions = new MemoryCacheEntryOptions()
					// Keep in cache for this time, reset time if accessed
					.SetSlidingExpiration(TimeSpan.FromDays(Constant.ExpireInDays));

				// Cache the certificate
				Cache.Set(Constant.Certificate, x509Certificate, cacheOptions);
				return x509Certificate;
			}
			catch (Exception ex)
			{
				Console.Error.WriteLine(ex.Message);
				throw new Exception("Error while accessing Key Vault");
			}
		}
	}
}
