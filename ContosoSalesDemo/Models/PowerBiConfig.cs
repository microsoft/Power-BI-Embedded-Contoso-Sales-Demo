// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Models
{
	public class PowerBiConfig
	{
		// Id of Power BI workspace in which the report is present
		public string WorkspaceId { get; set; }

		// Id of Power BI report to be embedded
		public string ReportId { get; set; }
	}
}
