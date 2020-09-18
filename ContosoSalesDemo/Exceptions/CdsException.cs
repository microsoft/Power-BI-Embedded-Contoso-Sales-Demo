// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Exceptions
{
	using System;

	public class CdsException : Exception
	{
		public CdsException()
		{
		}

		public CdsException(string message)
			: base(message)
		{
		}
	}
}
