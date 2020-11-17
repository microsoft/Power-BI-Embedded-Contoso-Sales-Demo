// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Models
{
	using Microsoft.PowerBI.Api.Models;
	using System;

	public class EmbedParams
	{
		// Type of Power BI content to be embedded
		public string Type { get; set; }

		// Id of the Power BI content
		public Guid Id { get; set; }

		// Embed url used to embed the Power BI content
		public string EmbedUrl { get; set; }

		// Embed token used to embed the Power BI content
		public EmbedToken EmbedToken { get; set; }

		// Default page to load on report render
		public string DefaultPage { get; set; }
	}
}
