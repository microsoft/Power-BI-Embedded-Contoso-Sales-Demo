// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo
{
	public class JwtTokenConfig
	{
		public string Issuer { get; set; }
		public string Audience { get; set; }
		public string ExpiresInMinutes { get; set; }
	}
}
