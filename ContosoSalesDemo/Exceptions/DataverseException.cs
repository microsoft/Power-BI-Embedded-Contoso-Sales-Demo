// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Exceptions
{
	using System;

	public class DataverseException : Exception
	{
		public DataverseException()
		{
		}

		public DataverseException(string message)
			: base(message)
		{
		}
	}
}
