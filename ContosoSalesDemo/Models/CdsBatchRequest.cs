// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Models
{
	public class CdsBatchRequest
	{
		public string httpMethod { get; set; }
		public string requestUri { get; set; }
		public string reqBodyJson { get; set; }
		public bool preferResponse { get; set; }

		public CdsBatchRequest(string httpMethod, string requestUri, string reqBodyJson, bool preferResponse = false)
		{
			this.httpMethod = httpMethod;
			this.requestUri = requestUri;
			this.reqBodyJson = reqBodyJson;
			this.preferResponse = preferResponse;
		}
	}
}
