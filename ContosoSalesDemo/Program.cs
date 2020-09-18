// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo
{
	using Microsoft.AspNetCore.Hosting;
	using Microsoft.Azure.KeyVault;
	using Microsoft.Azure.Services.AppAuthentication;
	using Microsoft.Extensions.Configuration;
	using Microsoft.Extensions.Configuration.AzureKeyVault;
	using Microsoft.Extensions.Hosting;
	using System.Collections.Generic;
	using System.Text;

	public class Program
	{
		public static void Main(string[] args)
		{
			CreateHostBuilder(args).Build().Run();
		}

		public static IHostBuilder CreateHostBuilder(string[] args) =>
			Host.CreateDefaultBuilder(args)
				.ConfigureAppConfiguration((context, config) =>
				{
					var builtConfig = config.Build();
					
					var azureServiceTokenProvider = new AzureServiceTokenProvider();
					var keyVaultClient = new KeyVaultClient(
						new KeyVaultClient.AuthenticationCallback(
							azureServiceTokenProvider.KeyVaultTokenCallback));

						// Load Secrets and Certificates from Azure Key Vault
						config.AddAzureKeyVault($"https://{builtConfig["KeyVault:KeyVaultName"]}.vault.azure.net/",
							keyVaultClient,
							new DefaultKeyVaultSecretManager());

						// Get Key from Azure Key Vault
						var key = keyVaultClient.GetKeyAsync($"https://{builtConfig["KeyVault:KeyVaultName"]}.vault.azure.net/keys/{builtConfig["KeyVault:KeyName"]}/{builtConfig["KeyVault:KeyVersion"]}").Result;
						var signingKey = Encoding.UTF8.GetString(key.Key.N);
						
						IConfigurationRoot keyConfig = new ConfigurationBuilder()
							.AddInMemoryCollection(new [] { new KeyValuePair<string, string>(builtConfig["KeyVault:KeyName"], signingKey) })
							.Build();

						// Add Key to configuration
						config.AddConfiguration(keyConfig);
				})
				.ConfigureWebHostDefaults(webBuilder =>
				{
					webBuilder.UseStartup<Startup>();
				});
	}
}
