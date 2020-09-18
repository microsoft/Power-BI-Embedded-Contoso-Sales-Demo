// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace WarehouseDemo.Helpers
{
	using System;
	using System.Linq;
	using System.Security.Claims;

	public static class JwtAuthHelper
	{
		/// <summary>
		/// Get username and role from token claims
		/// </summary>
		/// <returns>Username and role as Tuple</returns>
		public static (string username, string role) GetUsernameAndRole(ClaimsIdentity claimsIdentity)
		{
			var tokenClaims = claimsIdentity.Claims;
			(string username, string role) userInfo;
			userInfo.role = tokenClaims.Where(claim => claim.Type == ClaimTypes.Role).FirstOrDefault() ? .Value;
			userInfo.username = tokenClaims.Where(claim => claim.Type == "username").FirstOrDefault() ? .Value;

			// Anonymous users' role is Sales Person and they not have an username
			if (userInfo.username is null && string.Equals(userInfo.role, Constant.SalesPersonRole, StringComparison.InvariantCulture))
			{
				userInfo.username = "anonymous";
			}

			return userInfo;
		}
	}
}
