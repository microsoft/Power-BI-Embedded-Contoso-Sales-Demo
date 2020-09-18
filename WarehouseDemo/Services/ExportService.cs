// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

namespace WarehouseDemo.Service
{
	using Microsoft.PowerBI.Api;
	using Microsoft.PowerBI.Api.Models;
	using Microsoft.Rest;
	using System;
	using System.Collections.Generic;
	using System.IO;
	using System.Threading.Tasks;
	using WarehouseDemo.Models;

	public class ExportService
	{
		private TokenCredentials tokenCredentials;

		public ExportService(string aadToken)
		{
			tokenCredentials = new TokenCredentials(aadToken, "Bearer");
		}

		/// <summary>
		/// Get exported report file
		/// </summary>
		/// <returns>Wrapper object with exported file as a stream object and its extension</returns>
		public async Task<ExportedFile> GetExportedFile(Guid workspaceId, Guid reportId, string pageName, string fileFormat, string pageState = null, string username = null, string role = null)
		{
			FileFormat exportFormat;
			string mimeType;
			switch (fileFormat.ToUpper())
			{
				case Constant.PDF:
					exportFormat = FileFormat.PDF;
					mimeType = Constant.MimeTypePdf;
					break;
				
				case Constant.PPT:
					exportFormat = FileFormat.PPTX;
					mimeType = Constant.MimeTypePptx;
					break;
				
				case Constant.PNG: 
					exportFormat = FileFormat.PNG;
					mimeType = Constant.MimeTypePng;
					break;

				default: throw new Exception("Provide a valid export file type");
			}

			using (var pbiClient = new PowerBIClient(new Uri(Constant.PowerBiApiUri), tokenCredentials))
			{
				try
				{
					var exportId = await InitExportRequest(pbiClient, workspaceId, reportId, pageName, exportFormat, pageState, username, role);
					var fileExport = await GetFileExport(pbiClient, workspaceId, reportId, exportId);

					if (fileExport.Status != ExportState.Succeeded)
					{
						throw new Exception("Failed to export report");	
					}

					// Get exported file as stream object
					var memoryStream = new MemoryStream();
					using (var exportStream = await pbiClient.Reports.GetFileOfExportToFileAsync(workspaceId, reportId, fileExport.Id))
					{
						await exportStream.CopyToAsync(memoryStream);
					}

					return new ExportedFile
					{
						MemoryStream = memoryStream,
						FileName = $"{Constant.ExportFileName}{fileExport.ResourceFileExtension}",
						MimeType = mimeType
					};
				}
				catch (AggregateException ae)
				{
					ae.Handle((ex) =>
					{
						if (ex is HttpOperationException)
						{
							return ex is HttpOperationException;
						}
						return false;
					});
					return null;
				}
			}
		}

		/// <summary>
		/// Initialize export request for report
		/// </summary>
		/// <returns>Id of Export request</returns>
		private async Task<string> InitExportRequest(PowerBIClient pbiClient, Guid workspaceId, Guid reportId, string pageName, FileFormat fileFormat, string pageState = null, string username = null, string role = null)
		{
			PageBookmark pageBookmark = null;

			if (!string.IsNullOrWhiteSpace(pageState))
			{
				// To export report page with current bookmark
				pageBookmark = new PageBookmark(null, pageState);
			}

			// Get Power BI report object
			var pbiReport = pbiClient.Reports.GetReportInGroup(workspaceId, reportId);

			// Create effective identity for current user
			List<EffectiveIdentity> identities = null;

			if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(role))
			{
				identities = new List<EffectiveIdentity> { new EffectiveIdentity(username: username, roles: new List<string> { role }, datasets: new List<string> { pbiReport.DatasetId }) };
			}

			var powerBIReportExportConfiguration = new PowerBIReportExportConfiguration
			{
				Settings = new ExportReportSettings
				{
					Locale = Constant.DefaultLocale
				},

				// Initialize list of pages along with their state to be exported
				Pages = new List<ExportReportPage>() { new ExportReportPage(pageName, pageBookmark) },

				Identities = identities
			};

			var exportRequest = new ExportReportRequest
			{
				Format = fileFormat,
				PowerBIReportConfiguration = powerBIReportExportConfiguration,
			};

			// Initiate export process
			var export = await pbiClient.Reports.ExportToFileInGroupAsync(workspaceId, reportId, exportRequest);
			return export.Id;
		}

		/// <summary>
		/// Get exported file status
		/// </summary>
		/// <returns>Export request status object</returns>
		private async Task<Export> GetFileExport(PowerBIClient pbiClient, Guid workspaceId, Guid reportId, string exportId)
		{
			var startTime = DateTime.UtcNow;
			Export exportStatus = null;

			do
			{
				// Return if timeout occurs
				if (DateTime.UtcNow.Subtract(startTime).TotalMinutes >= Constant.ExportTimeoutInMinutes)
				{
					return null;
				}

				var httpMessage = await pbiClient.Reports.GetExportToFileStatusInGroupWithHttpMessagesAsync(workspaceId, reportId, exportId);
				exportStatus = httpMessage.Body;

				if (exportStatus.Status == ExportState.Running || exportStatus.Status == ExportState.NotStarted)
				{
					// Extract wait time from response header
					var retryAfter = httpMessage.Response.Headers.RetryAfter;
					int retryAfterInSec = retryAfter.Delta.Value.Seconds;

					// Wait before polling again
					await Task.Delay(retryAfterInSec * 1000);
				}
			}

			// While not in a terminal state, keep polling
			while (exportStatus.Status != ExportState.Succeeded && exportStatus.Status != ExportState.Failed);
			return exportStatus;
		}
	}
}
