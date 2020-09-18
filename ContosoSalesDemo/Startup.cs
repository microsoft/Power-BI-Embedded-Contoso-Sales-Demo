// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo
{
	using Microsoft.AspNetCore.Authorization;
	using Microsoft.AspNetCore.Builder;
	using Microsoft.AspNetCore.Hosting;
	using Microsoft.AspNetCore.Mvc.Authorization;
	using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
	using Microsoft.Extensions.Configuration;
	using Microsoft.Extensions.DependencyInjection;
	using Microsoft.Extensions.Hosting;
	using Microsoft.Identity.Web;
	using Microsoft.Identity.Web.TokenCacheProviders.InMemory;
	using Microsoft.IdentityModel.Tokens;
	using System.Text;
	using ContosoSalesDemo.Models;

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
			services.AddMemoryCache();
			services.AddHttpClient();
			services.AddAuthentication("OAuth")
				.AddJwtBearer("OAuth", options =>
				{
					// Create signature for JWT token
					var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration[Configuration["KeyVault:KeyName"]]));

					// Get validation parameters
					var issuer = Configuration.GetSection("JwtToken:Issuer").Value;
					var audience = Configuration.GetSection("JwtToken:Audience").Value;

					options.TokenValidationParameters = new TokenValidationParameters()
					{
						ValidateAudience = true,
						ValidateIssuer = true,
						ValidateIssuerSigningKey = true,
						ValidateLifetime = true,
						ValidIssuer = issuer,
						ValidAudience = audience,
						IssuerSigningKey = signingKey
					};
				})
				.AddMicrosoftWebApiCallsWebApi(

					// Populate confidential client properties
					confidentialClientOptions =>
					{
						confidentialClientOptions.Instance = Configuration["AzureAd:Instance"];
						confidentialClientOptions.ClientId = Configuration["AzureAd:ClientId"];
						confidentialClientOptions.TenantId = Configuration["AzureAd:TenantId"];
					},

					// Load certificate in options for client assertion
					microsoftIdentityOptions =>
					{
						microsoftIdentityOptions.ClientCertificates = new CertificateDescription[]
						{
							CertificateDescription.FromBase64Encoded(Configuration[Configuration["KeyVault:CertificateName"]])
						};
					}
				)
				.AddInMemoryTokenCaches();

			// Get user roles
			var salesManagerRole = Configuration.GetSection("Users:SalesManager:Role").Value;
			var salesPersonRole = Configuration.GetSection("Users:SalesPerson:Role").Value;

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

			services.AddControllersWithViews(options => {
				options.Filters.Add(new AuthorizeFilter(
					new AuthorizationPolicyBuilder()
						.RequireAuthenticatedUser()
						.RequireRole(salesManagerRole, salesPersonRole)
						.RequireClaim("scope")
						.Build()
				));
			});

			services.AddAuthorization(options => {
				// GeneralUser policy
				options.AddPolicy(Constant.GeneralUserPolicyName,
					policy => policy.RequireClaim("scope"));

				// FieldUser policy
				options.AddPolicy(Constant.FieldUserPolicyName,
					policy => policy.RequireClaim("scope", new [] {Configuration.GetSection("Users:SalesPerson:Scope").Value}));
			});

			// In production, the React files will be served from this directory
			services.AddSpaStaticFiles(configuration =>
			{
				configuration.RootPath = "ClientApp/build";
			});

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
