// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Tests
{
	using ContosoSalesDemo;
	using ContosoSalesDemo.Service;
	using Microsoft.Extensions.Options;
	using Microsoft.IdentityModel.Tokens;
	using System;
	using System.Collections.Generic;
	using System.IdentityModel.Tokens.Jwt;
	using System.Security.Claims;
	using System.Security.Cryptography;
	using System.Text;
	using System.Threading.Tasks;
	using Xunit;

	public class JwtTokenServiceTests : IDisposable
	{
		private const string Issuer = "https://issuer.example";
		private const string Audience = "ContosoSalesDemo";
		private readonly TestRsaTokenSigner tokenSigner = new TestRsaTokenSigner();

		[Fact]
		public async Task GenerateTokenCreatesValidRs256Token()
		{
			var service = CreateService();

			var result = await service.GenerateToken(new List<Claim>
			{
				new Claim("role", "Sales Manager"),
				new Claim("scope", "ReadWrite")
			});
			var token = result.Value<string>("access_token");
			var handler = new JwtSecurityTokenHandler();
			var principal = handler.ValidateToken(token, ValidationParameters(), out var validatedToken);

			var jwt = Assert.IsType<JwtSecurityToken>(validatedToken);
			Assert.Equal(SecurityAlgorithms.RsaSha256, jwt.Header.Alg);
			Assert.Equal(tokenSigner.KeyId, jwt.Header.Kid);
			Assert.Equal("ReadWrite", principal.FindFirst("scope")?.Value);
		}

		[Fact]
		public void ValidationRejectsHs256TokenDerivedFromPublicKeyMaterial()
		{
			var publicKeyMaterial = tokenSigner.PublicModulus;
			var oldSigningKey = Encoding.UTF8.GetBytes(Encoding.UTF8.GetString(publicKeyMaterial));
			var symmetricKey = new SymmetricSecurityKey(oldSigningKey) { KeyId = tokenSigner.KeyId };
			var token = new JwtSecurityToken(
				Issuer,
				Audience,
				expires: DateTime.UtcNow.AddMinutes(5),
				signingCredentials: new SigningCredentials(symmetricKey, SecurityAlgorithms.HmacSha256));
			var encodedToken = new JwtSecurityTokenHandler().WriteToken(token);

			Assert.ThrowsAny<SecurityTokenException>(() =>
				new JwtSecurityTokenHandler().ValidateToken(encodedToken, ValidationParameters(), out _));
		}

		public void Dispose()
		{
			tokenSigner.Dispose();
		}

		private JwtTokenService CreateService()
		{
			return new JwtTokenService(
				tokenSigner,
				Options.Create(new JwtTokenConfig
				{
					Issuer = Issuer,
					Audience = Audience,
					ExpiresInMinutes = "60"
				}));
		}

		private TokenValidationParameters ValidationParameters()
		{
			return new TokenValidationParameters
			{
				ValidateIssuer = true,
				ValidateAudience = true,
				ValidateIssuerSigningKey = true,
				ValidateLifetime = true,
				RequireSignedTokens = true,
				ValidIssuer = Issuer,
				ValidAudience = Audience,
				IssuerSigningKey = tokenSigner.ValidationKey,
				ValidAlgorithms = new [] { SecurityAlgorithms.RsaSha256 }
			};
		}

		private sealed class TestRsaTokenSigner : IJwtTokenSigner, IDisposable
		{
			private readonly RSA rsa = RSA.Create(2048);

			public TestRsaTokenSigner()
			{
				KeyId = "https://vault.example/keys/jwt-signing/test-version";
				ValidationKey = new RsaSecurityKey(rsa) { KeyId = KeyId };
			}

			public string KeyId { get; }

			public byte[] PublicModulus => rsa.ExportParameters(false).Modulus;

			public SecurityKey ValidationKey { get; }

			public Task<byte[]> SignDigest(byte[] digest)
			{
				return Task.FromResult(rsa.SignHash(digest, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1));
			}

			public void Dispose()
			{
				rsa.Dispose();
			}
		}
	}
}
