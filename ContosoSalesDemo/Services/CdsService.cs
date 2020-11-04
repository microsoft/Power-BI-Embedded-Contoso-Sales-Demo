// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Service
{
	using ContosoSalesDemo.Exceptions;
	using ContosoSalesDemo.Helpers;
	using ContosoSalesDemo.Models;
	using Microsoft.Extensions.Options;
	using Newtonsoft.Json;
	using Newtonsoft.Json.Linq;
	using System;
	using System.Globalization;
	using System.Net.Http;
	using System.Net.Http.Headers;
	using System.Text;
	using System.Threading.Tasks;

	public class CdsService : IDisposable
	{
		private readonly AadService aadService;
		private readonly IOptions<CdsConfig> cdsConfig;
		private readonly HttpClient cdsClient;
		private readonly CultureInfo cultureInfo = CultureInfo.InvariantCulture;
		private bool disposedValue;

		public CdsService(AadService aadService, IOptions<CdsConfig> cdsConfig)
		{
			this.aadService = aadService;
			this.cdsConfig = cdsConfig;
			this.cdsClient = GetCdsClientAsync().Result;
		}

		/// <summary>
		/// Generate CDS client object
		/// </summary>
		/// <returns>CDS client object</returns>
		private async Task<HttpClient> GetCdsClientAsync()
		{
			var aadToken = await aadService.GetAadToken(new string[] { cdsConfig.Value.Scope });
			HttpClient cdsClient = new HttpClient();
			cdsClient.DefaultRequestHeaders.Accept.Clear();
			cdsClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
			cdsClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", aadToken);
			return cdsClient;
		}

		protected virtual void Dispose(bool disposing)
		{
			if (!disposedValue)
			{
				if (disposing)
				{
					cdsClient.Dispose();
				}

				disposedValue = true;
			}
		}

		public void Dispose()
		{
			// Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
			Dispose(disposing: true);
			GC.SuppressFinalize(this);
		}

		/// <summary>
		/// Parse json data of a CDS row into Activity/Opportunities/Leads instance
		/// </summary>
		/// <returns>
		/// Tuple of Id field for the parsed entity, An instance of parsed Activity, Opportunities or Leads class
		/// </returns>
		public (string, dynamic) ParseDataRowFromJson(string dataRowJson, string entityType)
		{
			// Set member variables and parse dataRowJson
			switch (entityType)
			{
				case Constant.EntityNameActivities:
					return (Constant.EntityIdFieldActivities, Activities.FromJson(dataRowJson));
				case Constant.EntityNameOpportunities:
					return (Constant.EntityIdFieldOpportunities, Opportunities.FromJson(dataRowJson));
				case Constant.EntityNameLeads:
					return (Constant.EntityIdFieldLeads, Leads.FromJson(dataRowJson));
				default:
					throw new CdsException(Constant.InvalidEntity);
			}
		}

		/// <summary>
		/// Update existing data row
		///  1. Get guid of row with given baseId and isLatestFieldName 1
		///  2. Set isLatestFieldName to 0 for this row
		///  3. Insert new row with updated data fields with given baseId and isLatestFieldName set to 1
		/// </summary>
		/// <returns>
		/// Task
		/// </returns>
		public async Task UpdateData(string baseRowGuid, dynamic newDataRow, string idField, string entityName)
		{
			string[] requiredFields = { idField, Constant.baseIdFieldName, Constant.isLatestFieldName };

			// Select parameter in CDS API accepts comma separated field names
			var selectQueryFields = string.Join(",", requiredFields);

			// Params for select query
			var selectUrlParam = $"$select={selectQueryFields}";

			// Params for select query
			var filterUrlParam = $"$filter={Constant.baseIdFieldName} eq {baseRowGuid} and {Constant.isLatestFieldName} eq '{Constant.IsLatestTrue}'";

			UriBuilder requestUri = new UriBuilder("https", cdsConfig.Value.ApiBaseUrl);
			requestUri.Path = entityName;
			requestUri.Query = $"{selectUrlParam}&{filterUrlParam}";

			var response = await cdsClient.GetAsync(requestUri.Uri);

			if (!response.IsSuccessStatusCode)
			{
				throw new CdsException(Constant.InvalidUpdateDataFields);
			}

			// All current records
			var responseString = await response.Content.ReadAsStringAsync();

			// CDS get response model
			var responseJson = CdsGetResponse.FromJson(responseString);

			var values = responseJson.Values;

			// There should be exactly one row with {isLatestFieldNameName} = 1
			if (values.Count != 1)
			{
				throw new CdsException(Constant.InvalidUpdateDataFields);
			}

			var firstValue = values[0];

			var oldStringGuid = Convert.ToString(firstValue[idField], cultureInfo);

			// 1. Mark existing record as old. Passing the record's GUID to be marked as old
			// 2. Insert updated record as new
			await BatchUpdate(oldStringGuid, baseRowGuid, newDataRow, entityName);
		}

		/// <summary>
		/// Insert new row and set baseId and isLatest
		/// </summary>
		/// <returns>
		/// Task
		/// </returns>
		public async Task AddNewRow(dynamic newData, string entityName, string idField)
		{
			// Get account id for insert Lead
			if (entityName == Constant.EntityNameLeads)
			{
				// Get id for the given account name, or create new account and get its id
				string accountId = await GetOrGenerateId(Constant.EntityNameAccounts, "name", newData.ParentAccountName, "parentaccountid", Constant.EntityIdFieldAccounts);
				if (accountId is null)
				{
					throw new CdsException(Constant.InvalidInsertDataFields);
				}

				// remove name and add id
				newData.ParentAccountName = null;
				newData.ParentAccountforlead = $"{Constant.EntityNameAccounts}({accountId})";
			}

			newData.Baseid = null;
			newData.Islatest = Constant.IsLatestTrue;   // Mark latest row as "1"

			var jsonEntity = JsonConvert.SerializeObject(newData);
			var content = new StringContent(jsonEntity, Encoding.UTF8, "application/json");

			// Add "Prefer" header to return the inserted row
			cdsClient.DefaultRequestHeaders.Add("Prefer", "return=representation");

			UriBuilder requestUri = new UriBuilder("https", cdsConfig.Value.ApiBaseUrl);
			requestUri.Path = entityName;

			var response = await cdsClient.PostAsync(requestUri.Uri, content);

			if (!response.IsSuccessStatusCode)
			{
				throw new CdsException(Constant.InvalidInsertDataFields);
			}

			// Parse row guid from insert response
			var responseString = await response.Content.ReadAsStringAsync();

			// Create JSON for update baseid operation i.e. set baseId = rowGuid of inserted row
			var entity = new CdsEntity();

			// Set baseid with id field's value of inserted row
			switch (entityName)
			{
				case Constant.EntityNameActivities:
					entity.Baseid = Activities.FromJson(responseString).Id;
					break;
				case Constant.EntityNameOpportunities:
					entity.Baseid = Opportunities.FromJson(responseString).Id;
					break;
				case Constant.EntityNameLeads:
					entity.Baseid = Leads.FromJson(responseString).Id;
					break;
				case Constant.EntityNameAccounts:
					entity.Baseid = Accounts.FromJson(responseString).Id;
					break;
				default:
					throw new CdsException(Constant.InvalidEntity);
			}

			jsonEntity = JsonConvert.SerializeObject(entity);
			content = new StringContent(jsonEntity, Encoding.UTF8, "application/json");

			// Update operation
			requestUri = new UriBuilder("https", cdsConfig.Value.ApiBaseUrl);
			requestUri.Path = $"{entityName}({entity.Baseid})";

			response = await cdsClient.PatchAsync(requestUri.Uri, content);

			if (!response.IsSuccessStatusCode)
			{
				throw new CdsException(Constant.InvalidInsertDataFields);
			}
		}

		/// <summary>
		/// Combines multiple requests into a batch to make these requests atomic, i.e. all req rollback if one fails
		///	Refer: https://docs.microsoft.com/en-us/powerapps/developer/common-data-service/webapi/execute-batch-operations-using-web-api
		/// </summary>
		/// <returns>
		/// Task
		/// </returns>
		public async Task BatchUpdate(string rowGuid, string baseId, dynamic newData, string entityName)
		{
			var batchId = $"batch_batchid";
			var changesetId = $"changeset_changesetid";

			var cdsRequests = new CdsBatchRequest[2];

			// Custom Update
			// 1. Mark old
			var updateEntity = new CdsEntity();
			updateEntity.Islatest = Constant.IsLatestFalse;
			var updateEntityJson = JsonConvert.SerializeObject(updateEntity);

			cdsRequests[0] = new CdsBatchRequest("PATCH", $"https://{cdsConfig.Value.ApiBaseUrl}/{entityName}({rowGuid})", updateEntityJson);

			// 2. Insert row
			newData.Baseid = baseId;
			newData.Islatest = Constant.IsLatestTrue;   // Mark latest row as "1"
			var newDataJson = JsonConvert.SerializeObject(newData);

			cdsRequests[1] = new CdsBatchRequest("POST", $"https://{cdsConfig.Value.ApiBaseUrl}/{entityName}", newDataJson);

			// Build MultipartRequest content
			var reqContent = MultipartHelper.GenerateAtomicRequestContent(batchId, changesetId, cdsRequests);

			cdsClient.DefaultRequestHeaders.Accept.Clear();

			UriBuilder requestUri = new UriBuilder("https", cdsConfig.Value.ApiBaseUrl);
			requestUri.Path = "$batch";

			// Execute Batch request
			var response = await cdsClient.PostAsync(requestUri.Uri, reqContent);

			if (!response.IsSuccessStatusCode)
			{
				throw new CdsException(Constant.InvalidUpdateDataFields);
			}
		}

		/// <summary>
		/// Update existing data row
		///  1. Get guid of row with given baseId and isLatestFieldName 1
		///  2. Create batch request for the 3 operations
		/// </summary>
		/// <returns>
		/// Task
		/// </returns>
		public async Task UpdateAddData(
			string baseRowGuid,
			dynamic updatedData,
			string updateEntityName,
			string updateEntityIdField,
			dynamic newData,
			string addEntityName,
			string addEntityIdField)
		{
			// 1. Get guid of row with given baseId and isLatestFieldName 1
			string[] requiredFields = { updateEntityIdField, Constant.baseIdFieldName, Constant.isLatestFieldName };

			// Select parameter in CDS API accepts comma separated field names
			var selectQueryFields = string.Join(",", requiredFields);

			// Params for select query
			var selectUrlParam = $"$select={selectQueryFields}";

			// Params for select query
			var filterUrlParam = $"$filter={Constant.baseIdFieldName} eq {baseRowGuid} and {Constant.isLatestFieldName} eq '{Constant.IsLatestTrue}'";

			UriBuilder requestUri = new UriBuilder("https", cdsConfig.Value.ApiBaseUrl);
			requestUri.Path = updateEntityName;
			requestUri.Query = $"{selectUrlParam}&{filterUrlParam}";

			var response = await cdsClient.GetAsync(requestUri.Uri);

			if (!response.IsSuccessStatusCode)
			{
				throw new CdsException(Constant.InvalidUpdateDataFields);
			}

			// All current records
			var responseString = await response.Content.ReadAsStringAsync();

			// CDS get response model
			var responseJson = CdsGetResponse.FromJson(responseString);

			var values = responseJson.Values;

			// There should be exactly one row with {isLatestFieldNameName} == 1
			if (values.Count != 1)
			{
				throw new CdsException(Constant.InvalidUpdateDataFields);
			}

			var firstValue = values[0];

			var oldStringGuid = Convert.ToString(firstValue[updateEntityIdField], cultureInfo);

			// 2. Create batch request for the 3 operations
			await BatchUpdateAdd(oldStringGuid, baseRowGuid, updatedData, updateEntityName, newData, addEntityIdField, addEntityName);
		}

		/// <summary>
		/// Combines multiple requests into a batch to make these requests atomic, i.e. all req rollback if one fails
		///	Refer: https://docs.microsoft.com/en-us/powerapps/developer/common-data-service/webapi/execute-batch-operations-using-web-api
		///
		///  1a. Mark existing record as old. Passing the record's GUID to be marked as old
		///  1b. Insert updated record as new
		///	 2. Insert new record
		///  3. Set baseId = inserted row's guid
		/// </summary>
		/// <returns>
		/// Task
		/// </returns>
		public async Task BatchUpdateAdd(
			string rowGuid,
			string baseId,
			dynamic updatedData,
			string updateEntityName,
			dynamic newData,
			string newDataIdField,
			string addEntityName)
		{
			var batchId = $"batch_batchid";
			var changesetId = $"changeset_changesetid";

			var cdsRequests = new CdsBatchRequest[3];

			// 1a. Mark old (Custom Update)
			var updateEntity = new CdsEntity();
			updateEntity.Islatest = Constant.IsLatestFalse;
			string jsonTestEntity = JsonConvert.SerializeObject(updateEntity);

			cdsRequests[0] = new CdsBatchRequest("PATCH", $"https://{cdsConfig.Value.ApiBaseUrl}/{updateEntityName}({rowGuid})", jsonTestEntity);

			// 1b. Insert updated row
			updatedData.Baseid = baseId;
			updatedData.Islatest = Constant.IsLatestTrue;   // Mark latest row as "1"
			var updatedDataJson = JsonConvert.SerializeObject(updatedData);

			cdsRequests[1] = new CdsBatchRequest("POST", $"https://{cdsConfig.Value.ApiBaseUrl}/{updateEntityName}", updatedDataJson);

			// 2. Insert new row
			newData.Islatest = Constant.IsLatestTrue;   // Mark latest row as "1"
			var newDataJson = JsonConvert.SerializeObject(newData);

			// NOTE: Set preferResponse = true for atmost one API request in a batch
			var preferDataResponse = true;
			cdsRequests[2] = new CdsBatchRequest("POST", $"https://{cdsConfig.Value.ApiBaseUrl}/{addEntityName}", newDataJson, preferDataResponse);

			// Build MultipartRequest content
			var reqContent = MultipartHelper.GenerateAtomicRequestContent(batchId, changesetId, cdsRequests);

			cdsClient.DefaultRequestHeaders.Accept.Clear();

			UriBuilder requestUri = new UriBuilder("https", cdsConfig.Value.ApiBaseUrl);
			requestUri.Path = "$batch";

			// Execute Batch request
			var response = await cdsClient.PostAsync(requestUri.Uri, reqContent);

			if (!response.IsSuccessStatusCode)
			{
				throw new CdsException(Constant.InvalidUpdateDataFields);
			}

			// Return when data response was not requested
			if (!preferDataResponse)
			{
				return;
			}

			// 3. Set baseId = inserted row's guid

			var resString = await response.Content.ReadAsStringAsync();

			// Get JSON data from the batch response
			var insertedRowJson = MultipartHelper.GetJsonData(resString);
			var insertedRow = JObject.Parse(insertedRowJson);
			var insertedRowGuid = Convert.ToString(insertedRow[newDataIdField], cultureInfo);

			// Create JSON for update operation i.e. set baseId = rowGuid of inserted row
			var entity = new CdsEntity();
			entity.Baseid = insertedRowGuid;

			var jsonEntity = JsonConvert.SerializeObject(entity);
			var content = new StringContent(jsonEntity, Encoding.UTF8, "application/json");

			// Update operation
			requestUri = new UriBuilder("https", cdsConfig.Value.ApiBaseUrl);
			requestUri.Path = $"{addEntityName}({insertedRowGuid})";

			response = await cdsClient.PatchAsync(requestUri.Uri, content);

			if (!response.IsSuccessStatusCode)
			{
				throw new CdsException(Constant.InvalidUpdateDataFields);
			}
		}

		/// <summary>
		/// Gets values in the given table with given select and filter params
		/// </summary>
		/// <returns>
		/// Returns list of values which match the given parameters
		/// </returns>
		public async Task<JArray> GetValues(string entityName, string[] selectFields, string filterUrlParam)
		{
			// Select parameter in CDS API accepts comma separated field names
			var selectQueryFields = string.Join(",", selectFields);

			// Params for select query
			var selectUrlParam = $"$select={selectQueryFields}";

			UriBuilder requestUri = new UriBuilder("https", cdsConfig.Value.ApiBaseUrl);
			requestUri.Path = entityName;
			requestUri.Query = $"{selectUrlParam}&$filter={filterUrlParam}";

			var response = await cdsClient.GetAsync(requestUri.Uri);

			if (!response.IsSuccessStatusCode)
			{
				throw new CdsException(Constant.InvalidInsertDataFields);
			}

			// Parse response
			var responseString = await response.Content.ReadAsStringAsync();

			// CDS get response model
			var responseJson = CdsGetResponse.FromJson(responseString);

			return responseJson.Values;
		}

		/// <summary>
		/// Generates a new Id in the given table if does not exist already
		///	Inserts a new row when given row does not exist and returns the Id of the newly inserted row
		///	https://docs.microsoft.com/en-us/powerapps/developer/common-data-service/webapi/retrieve-entity-using-web-api#retrieve-using-an-alternate-key
		/// </summary>
		/// <returns>
		/// Returns Id of given queryFieldValue parameter
		/// </returns>
		public async Task<string> GetOrGenerateId(string queryEntityName, string queryFieldName, string queryFieldValue, string selectIdFieldName, string getIdFieldName)
		{
			var values = await GetValues(queryEntityName, new string[] { selectIdFieldName }, $"{queryFieldName} eq '{queryFieldValue}'");

			// Check if fieldValue already exists in table
			if (values != null && values.Count > 0)
			{
				// Return the id of first match
				return Convert.ToString(values[0][getIdFieldName], cultureInfo);
			}

			// An existing row not found, insert new row

			// New row's data
			// Note: We are creating a JObject as queryFieldName is dynamic
			var insertObject = new JObject();
			insertObject[queryFieldName] = queryFieldValue;

			// Add row creation date property
			insertObject[Constant.RowCreationDateFieldName] = DateTime.UtcNow.ToString(Constant.CdsDateFormat);

			var insertObjectJson = JsonConvert.SerializeObject(insertObject);
			var reqContent = new StringContent(insertObjectJson, Encoding.UTF8, "application/json");

			// Add "Prefer" header to return the inserted row
			cdsClient.DefaultRequestHeaders.Add("Prefer", "return=representation");

			UriBuilder requestUri = new UriBuilder("https", cdsConfig.Value.ApiBaseUrl);
			requestUri.Path = queryEntityName;

			var response = await cdsClient.PostAsync(requestUri.Uri, reqContent);

			if (!response.IsSuccessStatusCode)
			{
				throw new CdsException(Constant.InvalidInsertDataFields);
			}

			// Parse response
			var responseString = await response.Content.ReadAsStringAsync();

			// Return id field's value of inserted row
			switch (queryEntityName)
			{
				case Constant.EntityNameActivities:
					return Activities.FromJson(responseString).Id;
				case Constant.EntityNameOpportunities:
					return Opportunities.FromJson(responseString).Id;
				case Constant.EntityNameLeads:
					return Leads.FromJson(responseString).Id;
				case Constant.EntityNameAccounts:
					return Accounts.FromJson(responseString).Id;
				default:
					throw new CdsException(Constant.InvalidEntity);
			}
		}

		/// <summary>
		/// Insert new row in after setting baseId and isLatest = "1"
		/// </summary>
		/// <returns>
		/// void
		/// </returns>
		public void SetRowCreationDate(dynamic newData)
		{
			var currentDate = DateTime.UtcNow;
			newData.RowCreationDate = currentDate.ToString(Constant.CdsDateFormat);
		}
	}
}
