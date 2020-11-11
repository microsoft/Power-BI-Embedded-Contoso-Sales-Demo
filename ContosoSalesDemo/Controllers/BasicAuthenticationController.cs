// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Controllers
{
	using ContosoSalesDemo.Helpers;
	using ContosoSalesDemo.Models;
	using Microsoft.AspNetCore.Authorization;
	using Microsoft.AspNetCore.Mvc;
	using Microsoft.Extensions.Configuration;
	using Microsoft.Extensions.Logging;
	using Microsoft.Extensions.Options;
	using Microsoft.IdentityModel.Tokens;
	using Newtonsoft.Json.Linq;
	using System;
	using System.Collections.Generic;
	using System.Globalization;
	using System.IdentityModel.Tokens.Jwt;
	using System.Security.Claims;
	using System.Text;
	using System.Text.Json;

	/**
	 * DO NOT USE BELOW BASIC AUTHENTICATION IMPLEMENTATION FOR PRODUCTION APPLICATIONS,
	 * THE CURRENT IMPLEMENTATION IS FOR DEMO PURPOSE ONLY!!
	 */
	[ApiController]
	[Route("[controller]")]
	public class BasicAuthenticationController : ControllerBase
	{
		private readonly IConfiguration configuration;
		private readonly IOptions<JwtTokenConfig> jwtTokenConfig;
		private readonly IOptions<UserCollection> userCollection;
		private readonly ILogger<BasicAuthenticationController> logger;
		private readonly CultureInfo cultureInfo = CultureInfo.InvariantCulture;

		public BasicAuthenticationController(IConfiguration configuration, IOptions<JwtTokenConfig> jwtTokenConfig, IOptions<UserCollection> userCollection, ILogger<BasicAuthenticationController> logger)
		{
			this.configuration = configuration;
			this.jwtTokenConfig = jwtTokenConfig;
			this.userCollection = userCollection;
			this.logger = logger;
		}

		/**
		 * DO NOT USE BELOW BASIC AUTHENTICATION IMPLEMENTATION FOR PRODUCTION APPLICATIONS,
		 * THE CURRENT IMPLEMENTATION IS FOR DEMO PURPOSE ONLY!!
		 */
		[AllowAnonymous]
		[HttpPost("/api/auth/token")]
		public IActionResult GetJwtToken([FromHeader] string authorization, [FromBody] JsonElement selectedRole)
		{
			/**
			 * `[FromHeader] string authorization` gets the Authorization value from request header
			 * `[FromBody] JsonElement selectedRole` parses the JSON request body
			 *  An example header and body of a valid API request is shown below
			 * `header: { Content-Type: 'application/json', Authorization: 'Basic base64_encode(username:password)' }` // authorization parameter is optional for anonymous login
			 * `body: { 'role': 'Sales Manager' }`
			 */

			var selectedRoleValue = string.Empty;

			// Parse role property from selectedRole JSON object
			if (selectedRole.TryGetProperty("role", out JsonElement roleProperty))
			{
				selectedRoleValue = Convert.ToString(roleProperty, cultureInfo);
			}

			var user = ValidateUser(authorization, selectedRoleValue);

			if (user is null)
			{
				return BadRequest(Constant.InvalidUsernamePassword);
			}

			var jwtToken = GenerateJwtToken(user);
			return Ok(Convert.ToString(jwtToken, cultureInfo));
		}

		/// <summary>
		/// Validate authentication request
		/// </summary>
		/// <returns>User configuration</returns>
		private User ValidateUser(string authorization, string selectedRoleValue)
		{
			// Credentials are stored in Key Vault in the format username:password
			string actualUsername;
			string actualPassword;
			User user;

			// Check whether role is either Sales Person or Sales Manager
			if (string.Equals(selectedRoleValue, Constant.SalesManagerRole, StringComparison.InvariantCultureIgnoreCase))
			{
				actualUsername = configuration[Constant.SalesManagerUsername];
				actualPassword = configuration[Constant.SalesManagerPassword];
				user = userCollection.Value.SalesManager;
				logger.LogInformation($"{user.Username}, {Constant.SalesManagerRole}");
			}
			else if (string.Equals(selectedRoleValue, Constant.SalespersonRole, StringComparison.InvariantCultureIgnoreCase))
			{
				// Return anonymous user when authorization parameter is not present
				if (string.IsNullOrWhiteSpace(authorization))
				{
					logger.LogInformation($"Anonymous: {Constant.SalespersonRole}");
					return userCollection.Value.Anonymous;
				}

				actualUsername = configuration[Constant.SalespersonUsername];
				actualPassword = configuration[Constant.SalespersonPassword];
				user = userCollection.Value.Salesperson;
				logger.LogInformation($"{user.Username}, {Constant.SalespersonRole}");
			}
			else
			{
				return null;
			}

			// Stores credential passed in user request
			string[] credential;

			try
			{
				// Get user credentials from request header
				credential = ParamHelper.DecodeBase64EncodedString(authorization.Split(' ')[1].Trim()).Split(':');
			}
			catch (Exception)
			{
				// Return if request header is malformed
				return null;
			}

			// Check whether username and password matches
			if (!string.Equals(credential[0], actualUsername, StringComparison.InvariantCultureIgnoreCase) ||
				!string.Equals(credential[1], actualPassword)
			)
			{
				logger.LogInformation($"{Constant.InvalidUsernamePassword}, {credential[0]}, {credential[1]}, {selectedRoleValue}");
				return null;
			}

			return user;
		}

		/// <summary>
		/// Generate JWT token
		/// </summary>
		/// <returns>JWT token as string</returns>
		private JObject GenerateJwtToken(User user)
		{
			// To capture token claims
			var claims = new List<Claim>();

			// Get list of all user properties
			var userProps = user.GetType().GetProperties();
			foreach (var prop in userProps)
			{
				var value = prop.GetValue(user, null);
				if (value != null)
				{
					claims.Add(new Claim(prop.Name.ToLower(), Convert.ToString(value, cultureInfo)));
				}
			}

			// Time after which JWT token will expire
			var expirationTime = DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtTokenConfig.Value.ExpiresInMinutes));

			// Time before which JWT token will not be accepted for processing
			var notBeforeTime = DateTime.UtcNow;

			var signingKey = Encoding.UTF8.GetBytes(configuration[configuration["KeyVault:KeyName"]]);

			// Create token signature
			var securityKey = new SymmetricSecurityKey(signingKey);
			var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256Signature);

			// Create token header
			var tokenHeader = new JwtHeader(signingCredentials);

			// Create token payload
			var tokenPayload = new JwtPayload(jwtTokenConfig.Value.Issuer, jwtTokenConfig.Value.Audience, claims, notBeforeTime, expirationTime);

			// Create token
			var token = new JwtSecurityToken(tokenHeader, tokenPayload);
			var tokenHandler = new JwtSecurityTokenHandler();
			var jwtToken = tokenHandler.WriteToken(token);

			// Build token with necessary config here
			var tokenParams = new JObject {
				{ "access_token", jwtToken }
			};

			return tokenParams;
		}
	}
}
