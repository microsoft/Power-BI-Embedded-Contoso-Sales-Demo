// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Service
{
	using ContosoSalesDemo.Models;
	using Microsoft.Azure.KeyVault;
	using Microsoft.Azure.KeyVault.Models;
	using Microsoft.Azure.KeyVault.WebKey;
	using Microsoft.Extensions.Options;
	using Microsoft.IdentityModel.Tokens;
	using Newtonsoft.Json.Linq;
	using System;
	using System.Collections.Generic;
	using System.Globalization;
	using System.IdentityModel.Tokens.Jwt;
	using System.Linq;
	using System.Security.Claims;
	using System.Security.Cryptography;
	using System.Text;
	using System.Threading.Tasks;

	public interface IJwtTokenSigner
	{
		string KeyId { get; }

		SecurityKey ValidationKey { get; }

		Task<byte[]> SignDigest(byte[] digest);
	}

	public sealed class KeyVaultJwtTokenSigner : IJwtTokenSigner
	{
		private readonly KeyVaultClient keyVaultClient;
		private readonly string keyIdentifier;

		public KeyVaultJwtTokenSigner(KeyVaultClient keyVaultClient, KeyBundle keyBundle)
		{
			this.keyVaultClient = keyVaultClient ?? throw new ArgumentNullException(nameof(keyVaultClient));
			var currentTime = DateTime.UtcNow;

			if (keyBundle?.KeyIdentifier?.Identifier is null ||
				keyBundle.Key?.N is null ||
				keyBundle.Key.N.Length < 256 ||
				keyBundle.Key.E is null ||
				keyBundle.Key.KeyOps is null ||
				!keyBundle.Key.KeyOps.Contains("sign", StringComparer.OrdinalIgnoreCase) ||
				keyBundle.Attributes?.Enabled != true ||
				(keyBundle.Attributes.NotBefore.HasValue && keyBundle.Attributes.NotBefore.Value.ToUniversalTime() > currentTime) ||
				(keyBundle.Attributes.Expires.HasValue && keyBundle.Attributes.Expires.Value.ToUniversalTime() <= currentTime) ||
				(!string.Equals(keyBundle.Key.Kty, "RSA", StringComparison.OrdinalIgnoreCase) &&
				 !string.Equals(keyBundle.Key.Kty, "RSA-HSM", StringComparison.OrdinalIgnoreCase)))
			{
				throw new InvalidOperationException("The configured JWT signing key must be an active, versioned RSA Key Vault key of at least 2048 bits with sign enabled.");
			}

			this.keyIdentifier = keyBundle.KeyIdentifier.Identifier;
			var rsa = RSA.Create();
			rsa.ImportParameters(new RSAParameters
			{
				Modulus = keyBundle.Key.N,
				Exponent = keyBundle.Key.E
			});

			KeyId = keyIdentifier;
			ValidationKey = new RsaSecurityKey(rsa) { KeyId = KeyId };
		}

		public string KeyId { get; }

		public SecurityKey ValidationKey { get; }

		public async Task<byte[]> SignDigest(byte[] digest)
		{
			if (digest is null || digest.Length != 32)
			{
				throw new ArgumentException("RS256 requires a SHA-256 digest.", nameof(digest));
			}

			var result = await keyVaultClient.SignAsync(
				keyIdentifier,
				JsonWebKeySignatureAlgorithm.RS256,
				digest);

			if (result?.Result is null || result.Result.Length == 0)
			{
				throw new InvalidOperationException("Key Vault returned an empty JWT signature.");
			}

			return result.Result;
		}
	}

	public sealed class JwtTokenService
	{
		private readonly IJwtTokenSigner tokenSigner;
		private readonly IOptions<JwtTokenConfig> jwtTokenConfig;

		public JwtTokenService(IJwtTokenSigner tokenSigner, IOptions<JwtTokenConfig> jwtTokenConfig)
		{
			this.tokenSigner = tokenSigner ?? throw new ArgumentNullException(nameof(tokenSigner));
			this.jwtTokenConfig = jwtTokenConfig ?? throw new ArgumentNullException(nameof(jwtTokenConfig));
		}

		public async Task<JObject> GenerateToken(IEnumerable<Claim> claims)
		{
			if (claims is null)
			{
				throw new ArgumentNullException(nameof(claims));
			}

			if (!double.TryParse(
				jwtTokenConfig.Value.ExpiresInMinutes,
				NumberStyles.Float,
				CultureInfo.InvariantCulture,
				out var expiresInMinutes) ||
				expiresInMinutes <= 0)
			{
				throw new InvalidOperationException("JwtToken:ExpiresInMinutes must be a positive number.");
			}

			var currentTime = DateTime.UtcNow;
			var expirationTime = currentTime.AddMinutes(expiresInMinutes);
			var tokenHeader = new JwtHeader
			{
				{ "alg", SecurityAlgorithms.RsaSha256 },
				{ "typ", "JWT" },
				{ "kid", tokenSigner.KeyId }
			};
			var tokenPayload = new JwtPayload(
				jwtTokenConfig.Value.Issuer,
				jwtTokenConfig.Value.Audience,
				claims,
				currentTime,
				expirationTime);
			var encodedHeader = tokenHeader.Base64UrlEncode();
			var encodedPayload = tokenPayload.Base64UrlEncode();
			var signingInput = Encoding.ASCII.GetBytes($"{encodedHeader}.{encodedPayload}");

			byte[] digest;
			using (var sha256 = SHA256.Create())
			{
				digest = sha256.ComputeHash(signingInput);
			}

			var signature = await tokenSigner.SignDigest(digest);
			var jwtToken = $"{encodedHeader}.{encodedPayload}.{Base64UrlEncoder.Encode(signature)}";

			return new JObject {
				{ "access_token", jwtToken }
			};
		}
	}
}
