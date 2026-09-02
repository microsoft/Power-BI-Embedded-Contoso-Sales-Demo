// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Helpers
{
	using System;
	using System.Linq;

	public static class ODataQueryHelper
	{
		public static string StringLiteral(string value)
		{
			if (value is null)
			{
				throw new ArgumentNullException(nameof(value));
			}

			return $"'{value.Replace("'", "''")}'";
		}

		public static string BuildQuery(params (string Name, string Value)[] parameters)
		{
			return string.Join("&", parameters.Select(parameter =>
				$"{parameter.Name}={Uri.EscapeDataString(parameter.Value)}"));
		}
	}
}
