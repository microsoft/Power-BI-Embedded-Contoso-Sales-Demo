// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Tests
{
	using ContosoSalesDemo.Helpers;
	using System;
	using Xunit;

	public class ODataQueryHelperTests
	{
		[Fact]
		public void StringLiteralEscapesODataControlCharacters()
		{
			var literal = ODataQueryHelper.StringLiteral("x' or name eq 'Target & 100%");

			Assert.Equal("'x'' or name eq ''Target & 100%'", literal);
		}

		[Fact]
		public void BuildQueryTransportEncodesFilterValue()
		{
			var query = ODataQueryHelper.BuildQuery(
				("$select", "accountid"),
				("$filter", "name eq 'A&B%27'"));

			Assert.Equal("$select=accountid&$filter=name%20eq%20%27A%26B%2527%27", query);
		}

		[Fact]
		public void UriBuilderPreservesEncodedFilterAsOneQueryParameter()
		{
			var requestUri = new UriBuilder("https://example.test");
			requestUri.Query = ODataQueryHelper.BuildQuery(
				("$select", "accountid"),
				("$filter", "name eq 'x'' or name eq ''Target'"));

			Assert.Equal(
				"?$select=accountid&$filter=name%20eq%20%27x%27%27%20or%20name%20eq%20%27%27Target%27",
				requestUri.Uri.Query);
		}
	}
}
