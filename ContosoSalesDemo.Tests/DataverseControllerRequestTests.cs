// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Tests
{
	using ContosoSalesDemo.Models;
	using Newtonsoft.Json;
	using System;
	using Xunit;

	public class DataverseControllerRequestTests
	{
		[Fact]
		public void UpdateRequestAcceptsCanonicalGuid()
		{
			var expected = Guid.NewGuid();

			var request = UpdateDataRequest.FromJson(
				$"{{\"baseId\":\"{expected:D}\",\"updatedData\":\"{{}}\",\"updateTableType\":\"leads\"}}");

			Assert.Equal(expected, request.BaseId);
		}

		[Fact]
		public void UpdateRequestRejectsInjectedBaseId()
		{
			var json = "{\"baseId\":\"00000000-0000-0000-0000-000000000001 or crcb2_name eq 'Target'\",\"updatedData\":\"{}\",\"updateTableType\":\"leads\"}";

			Assert.ThrowsAny<JsonException>(() => UpdateDataRequest.FromJson(json));
		}
	}
}
