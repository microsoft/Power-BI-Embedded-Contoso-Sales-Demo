// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Helpers
{
	using ContosoSalesDemo.Exceptions;
	using ContosoSalesDemo.Models;
	using System.Globalization;
	using System.Net.Http;
	using System.Net.Http.Headers;
	using System.Text;

	public static class MultipartHelper
	{
		private const string DefaultReqHeaders = "Content-Type: application/json;type=entry";

		/// <summary>
		/// Creates a multipart/mixed content for the given Dataverse batch requests
		/// Refer: https://docs.microsoft.com/en-us/powerapps/developer/common-data-service/webapi/execute-batch-operations-using-web-api
		/// </summary>
		public static MultipartContent GenerateAtomicRequestContent(string batchId, string changeSetId, DataverseBatchRequest[] requests)
		{
			MultipartContent reqContent = new MultipartContent("mixed", batchId);

			MultipartContent changesetContent = new MultipartContent("mixed", changeSetId);

			var reqIndex = 0;
			foreach (var req in requests)
			{
				// Building Http request as text inside body of the batch request
				// Note: We are using batch operations API of Dataverse which only supports HTTP/1.1
				// https://docs.microsoft.com/en-us/powerapps/developer/common-data-service/webapi/execute-batch-operations-using-web-api
				var httpRequest = $"{req.httpMethod} {req.requestUri} HTTP/1.1";
				var reqHeaders = DefaultReqHeaders;

				// Get inserted row data
				if (req.preferResponse)
				{
					reqHeaders += "\nPrefer: return=representation";
				}

				// Building http request message for this changeset
				// Note: Http request is created as text as all values are either constants or result of serializing a DataverseTable model
				var requestMessage = $"{httpRequest}\n{reqHeaders}\n\n{req.reqBodyJson}\n";

				// Build the http request in text format for changesetContent
				// Purpose is to create HTTP API requests in form of text in the body of our [batch API request](https://docs.microsoft.com/en-us/powerapps/developer/common-data-service/webapi/execute-batch-operations-using-web-api#example)
				// We can only add HTTP content object to MultipartContent of .NET and it does not accept an HTTP request object
				// Currently, there is no way to convert an HTTP request object into the required string format for making a Dataverse batch API call
				var requestMessageContent = new StringContent(requestMessage, Encoding.UTF8);

				// Add other headers
				requestMessageContent.Headers.ContentType = new MediaTypeWithQualityHeaderValue("application/http");
				requestMessageContent.Headers.Add("Content-Transfer-Encoding", "binary");
				requestMessageContent.Headers.Add("Content-ID", System.Convert.ToString(reqIndex + 1, CultureInfo.InvariantCulture));

				// Add this request to the changeset
				changesetContent.Add(requestMessageContent);

				reqIndex += 1;
			}

			reqContent.Add(changesetContent);

			return reqContent;
		}

		/*
		The objective is to get the JSON in the response body of the last API request in the batch response.
		.NET has [MultipartReader](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.webutilities.multipartreader), 
		but the response format of [Dataverse batch request](https://docs.microsoft.com/en-us/powerapps/developer/common-data-service/webapi/execute-batch-operations-using-web-api#batch-requests) is as follows:
		
		--changeset_boundary

			Response of 1st API
			Response of 2nd API
			Response of nth API

		--changeset_boundary--
		
		Expected multipart response is like:
		
		--changeset_boundary

			Response of exactly one request

		--changeset_boundary--
		*/
		/// <summary>
		/// Extracts JSON string from given multipart response
		/// </summary>
		public static string GetJsonData(string multipartResponseBody)
		{
			// Get JSON data string
			var startIndex = multipartResponseBody.IndexOf('{');
			var endIndex = multipartResponseBody.LastIndexOf('}');

			if (startIndex == -1 || endIndex == -1)
			{
				throw new DataverseException("Multipart response does not contain json");
			}

			return multipartResponseBody.Substring(startIndex, endIndex - startIndex + 1);
		}
	}
}
