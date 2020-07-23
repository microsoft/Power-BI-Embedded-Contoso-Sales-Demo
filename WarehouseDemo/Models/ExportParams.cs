// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

namespace WarehouseDemo.Models
{
	public class ExportParams
	{
		// Name of report page to be exported
		public string PageName { get; set; }

		// Format of export file
		public string FileFormat { get; set; }

		// State of page to be exported
		public string PageState { get; set; }
	}
}
