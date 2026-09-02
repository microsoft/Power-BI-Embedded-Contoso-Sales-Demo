// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo
{
	using ContosoSalesDemo.Models;
	using ContosoSalesDemo.Service;
	using Microsoft.AspNetCore.Authorization;
	using Microsoft.AspNetCore.Builder;
	using Microsoft.AspNetCore.Hosting;
	using Microsoft.AspNetCore.Mvc.Authorization;
	using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
	using Microsoft.Azure.KeyVault;
	using Microsoft.Azure.Services.AppAuthentication;
	using Microsoft.Extensions.Configuration;
	using Microsoft.Extensions.DependencyInjection;
	using Microsoft.Extensions.Hosting;
	using Microsoft.IdentityModel.Tokens;
	using System;

	public class Startup
	{
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices(IServiceCollection services)
		{
			var keyVaultConfig = Configuration.GetSection("KeyVault").Get<KeyVaultConfig>();
			if (string.IsNullOrWhiteSpace(keyVaultConfig?.KeyVaultName) ||
				string.IsNullOrWhiteSpace(keyVaultConfig.KeyName) ||
				string.IsNullOrWhiteSpace(keyVaultConfig.KeyVersion))
			{
				throw new InvalidOperationException("KeyVault:KeyVaultName, KeyVault:KeyName, and KeyVault:KeyVersion are required.");
			}

			var azureServiceTokenProvider = new AzureServiceTokenProvider();
			var keyVaultClient = new KeyVaultClient(
				new KeyVaultClient.AuthenticationCallback(
					azureServiceTokenProvider.KeyVaultTokenCallback));
			var keyIdentifier = $"https://{keyVaultConfig.KeyVaultName}.vault.azure.net/keys/{keyVaultConfig.KeyName}/{keyVaultConfig.KeyVersion}";
			var keyBundle = keyVaultClient.GetKeyAsync(keyIdentifier).GetAwaiter().GetResult();
			var jwtTokenSigner = new KeyVaultJwtTokenSigner(keyVaultClient, keyBundle);

			services.AddAuthentication("OAuth")
				.AddJwtBearer("OAuth", options =>
				{
					// Get validation parameters
					var issuer = Configuration.GetSection("JwtToken:Issuer").Value;
					var audience = Configuration.GetSection("JwtToken:Audience").Value;

					options.TokenValidationParameters = new TokenValidationParameters()
					{
						ValidateAudience = true,
						ValidateIssuer = true,
						ValidateIssuerSigningKey = true,
						ValidateLifetime = true,
						RequireExpirationTime = true,
						RequireSignedTokens = true,
						ValidIssuer = issuer,
						ValidAudience = audience,
						IssuerSigningKey = jwtTokenSigner.ValidationKey,
						ValidAlgorithms = new [] { SecurityAlgorithms.RsaSha256 }
					};
				});

			// Get user roles
			var salesManagerRole = Configuration.GetSection("Users:SalesManager:Role").Value;
			var salesPersonRole = Configuration.GetSection("Users:Salesperson:Role").Value;

			// Check whether telemetry is On
			bool.TryParse(Configuration["Telemetry"], out var isTelemetryOn);
			if (isTelemetryOn)
			{
				// Get App Insights Instrumentation key from config
				var appInsightsInstrumentationKey = Configuration[Constant.AppInsightsInstrumentationKey];

				// Enable App Insights telemetry collection if Instrumentation key is available
				if (!string.IsNullOrWhiteSpace(appInsightsInstrumentationKey))
				{
					services.AddApplicationInsightsTelemetry(appInsightsInstrumentationKey);
				}
			}

			// Register AadService, DataverseService, EmbedService and ExportService for dependency injection
			services.AddScoped(typeof(AadService))
					.AddScoped(typeof(DataverseService))
					.AddScoped(typeof(EmbedService))
					.AddScoped(typeof(ExportService))
					.AddSingleton<IJwtTokenSigner>(jwtTokenSigner)
					.AddSingleton(typeof(JwtTokenService));

			services.AddControllersWithViews(options =>
			{
				options.Filters.Add(new AuthorizeFilter(
					new AuthorizationPolicyBuilder()
						.RequireAuthenticatedUser()
						.RequireRole(salesManagerRole, salesPersonRole)
						.RequireClaim("scope")
						.Build()
				));
			});

			services.AddAuthorization(options =>
			{
				// GeneralUser policy
				options.AddPolicy(Constant.GeneralUserPolicyName,
					policy => policy.RequireClaim("scope"));

				// FieldUser policy
				options.AddPolicy(Constant.FieldUserPolicyName,
					policy => policy.RequireClaim("scope", new [] {Configuration.GetSection("Users:Salesperson:Scope").Value}));
			});

			// In production, the React files will be served from this directory
			services.AddSpaStaticFiles(configuration =>
			{
				configuration.RootPath = "ClientApp/build";
			});

			// Load Dataverse Configuration
			services.Configure<DataverseConfig>(Configuration.GetSection("Dataverse"));

			// Load Key Vault configuration
			services.Configure<KeyVaultConfig>(Configuration.GetSection("KeyVault"));

			// Load Auth configuration
			services.Configure<AadConfig>(Configuration.GetSection("AzureAd"));

			// Load Power BI configuration
			services.Configure<PowerBiConfig>(Configuration.GetSection("PowerBi"));

			// Load authentication configuration
			services.Configure<JwtTokenConfig>(Configuration.GetSection("JwtToken"));

			// Load authentication configuration
			services.Configure<UserCollection>(Configuration.GetSection("Users"));
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}
			else
			{
				app.UseExceptionHandler("/Error");
				// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
				app.UseHsts();
			}

			app.UseHttpsRedirection();
			app.UseStaticFiles();
			app.UseSpaStaticFiles();
			app.UseRouting();
			app.UseAuthentication();
			app.UseAuthorization();
			app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllerRoute(
					name: "default",
					pattern: "{controller}/{action=Index}/{id?}");
			});
			app.UseSpa(spa =>
			{
				spa.Options.SourcePath = "ClientApp";

				if (env.IsDevelopment())
				{
					spa.UseReactDevelopmentServer(npmScript: "start");
				}
			});
		}
	}
}
