// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Models
{
	using System.IO;

	public class ExportedFile
	{
		// Stores exported report page stream
		public MemoryStream MemoryStream { get; set; }

		// Stores name of file with extension
		public string FileName { get; set; }

		// Stores the MIME type of the exported file
		public string MimeType { get; set; }
	}
}
