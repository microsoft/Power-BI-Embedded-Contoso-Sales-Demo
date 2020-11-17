// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Service
{
	using Microsoft.Identity.Client;
	using System;
	using System.Runtime.Caching;

	// Refer https://github.com/Azure-Samples/ms-identity-aspnet-webapp-openidconnect to token caching
	public class MSALMemoryTokenCache
	{
		/// <summary>
		/// The backing MemoryCache instance
		/// </summary>
		internal readonly MemoryCache memoryCache = MemoryCache.Default;

		/// <summary>
		/// The duration till the tokens are kept in memory cache. In production, a higher value, upto 90 days is recommended.
		/// </summary>
		private readonly DateTimeOffset cacheDuration = DateTimeOffset.Now.AddHours(48);

		/// <summary>
		/// Initializes a new instance of the <see cref="MSALMemoryTokenCache"/> class.
		/// </summary>
		/// <param name="tokenCache">The client's instance of the token cache.</param>
		public MSALMemoryTokenCache(ITokenCache tokenCache)
		{
			Initialize(tokenCache);
		}

		/// <summary>Initializes the cache instance</summary>
		/// <param name="tokenCache">The ITokenCache passed through the constructor</param>
		private void Initialize(ITokenCache tokenCache)
		{
			tokenCache.SetBeforeAccess(TokenCacheBeforeAccessNotification);
			tokenCache.SetAfterAccess(TokenCacheAfterAccessNotification);
		}

		/// <summary>
		/// Triggered right after MSAL accessed the cache.
		/// </summary>
		/// <param name="args">Contains parameters used by the MSAL call accessing the cache.</param>
		private void TokenCacheAfterAccessNotification(TokenCacheNotificationArgs args)
		{
			// if the access operation resulted in a cache update
			if (args.HasStateChanged)
			{
				string cacheKey = args.SuggestedCacheKey;
				if (args.HasTokens)
				{
					if (string.IsNullOrWhiteSpace(cacheKey))
						return;

					// Ideally, methods that load and persist should be thread safe.MemoryCache.Get() is thread safe.
					memoryCache.Set(cacheKey, args.TokenCache.SerializeMsalV3(), cacheDuration);
				}
				else
				{
					memoryCache.Remove(cacheKey);
				}
			}
		}

		/// <summary>
		/// Triggered right before MSAL needs to access the cache. Reload the cache from the persistence store in case it changed since the last access.
		/// </summary>
		/// <param name="args">Contains parameters used by the MSAL call accessing the cache.</param>
		private void TokenCacheBeforeAccessNotification(TokenCacheNotificationArgs args)
		{
			string cacheKey = args.SuggestedCacheKey;
			if (string.IsNullOrEmpty(cacheKey))
			{
				return;
			}

			byte[] tokenCacheBytes = (byte[])memoryCache.Get(cacheKey);
			args.TokenCache.DeserializeMsalV3(tokenCacheBytes, shouldClearExistingCache: true);
		}
	}
}