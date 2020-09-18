// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Helpers
{
	using System;
	using System.Text;

	public static class ParamHelper
	{
		/// <summary>
		/// Decode Base64 encoded string
		/// </summary>
		/// <returns>Base64 decoded string</returns>
		public static string DecodeBase64EncodedString(string base64String)
		{
			if (string.IsNullOrWhiteSpace(base64String))
			{
				return null;
			}

			return Encoding.UTF8.GetString(Convert.FromBase64String(base64String));
		}
	}
}
