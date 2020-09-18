// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace WarehouseDemo
{
	public class JwtTokenConfig
	{
		public string Issuer { get; set; }
		public string Audience { get; set; }
		public string ExpiresInMinutes { get; set; }
	}
}
