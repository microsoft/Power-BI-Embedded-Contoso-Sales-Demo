// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

namespace WarehouseDemo.Models
{
	public class PowerBiConfig
	{
		// Id of Power BI workspace in which the report is present
		public string WorkspaceId { get; set; }

		// Id of Power BI report to be embedded
		public string ReportId { get; set; }
	}
}
