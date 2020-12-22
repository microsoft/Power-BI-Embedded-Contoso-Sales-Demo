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

	public class DataverseService : IDisposable
	{
		private readonly AadService aadService;
		private readonly IOptions<DataverseConfig> dataverseConfig;
		private readonly HttpClient dataverseClient;
		private readonly CultureInfo cultureInfo = CultureInfo.InvariantCulture;
		private bool disposedValue;

		public DataverseService(AadService aadService, IOptions<DataverseConfig> dataverseConfig)
		{
			this.aadService = aadService;
			this.dataverseConfig = dataverseConfig;
			this.dataverseClient = GetDataverseClientAsync().Result;
		}

		/// <summary>
		/// Generate Dataverse client object
		/// </summary>
		/// <returns>Dataverse client object</returns>
		private async Task<HttpClient> GetDataverseClientAsync()
		{
			var aadToken = await aadService.GetAadToken(new string[] { dataverseConfig.Value.Scope });
			HttpClient dataverseClient = new HttpClient();
			dataverseClient.DefaultRequestHeaders.Accept.Clear();
			dataverseClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
			dataverseClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", aadToken);
			return dataverseClient;
		}

		protected virtual void Dispose(bool disposing)
		{
			if (!disposedValue)
			{
				if (disposing)
				{
					dataverseClient.Dispose();
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
		/// Parse json data of a Dataverse row into Activity/Opportunities/Leads instance
		/// </summary>
		/// <returns>
		/// Tuple of Id column for the parsed table, An instance of parsed Activity, Opportunities or Leads class
		/// </returns>
		public (string, dynamic) ParseDataRowFromJson(string dataRowJson, string tableType)
		{
			// Set member variables and parse dataRowJson
			switch (tableType)
			{
				case Constant.TableNameActivities:
					return (Constant.TableIdColumnActivities, Activities.FromJson(dataRowJson));
				case Constant.TableNameOpportunities:
					return (Constant.TableIdColumnOpportunities, Opportunities.FromJson(dataRowJson));
				case Constant.TableNameLeads:
					return (Constant.TableIdColumnLeads, Leads.FromJson(dataRowJson));
				default:
					throw new DataverseException(Constant.InvalidTable);
			}
		}

		/// <summary>
		/// Update existing data row
		///  1. Get guid of row with given baseId and isLatestColumnName 1
		///  2. Set isLatestColumnName to 0 for this row
		///  3. Insert new row with updated data columns with given baseId and isLatestColumnName set to 1
		/// </summary>
		/// <returns>
		/// Task
		/// </returns>
		public async Task UpdateData(string baseRowGuid, dynamic newDataRow, string idColumn, string tableName)
		{
			string[] requiredColumns = { idColumn, Constant.baseIdColumnName, Constant.isLatestColumnName };

			// Select parameter in Dataverse API accepts comma separated column names
			var selectQueryColumns = string.Join(",", requiredColumns);

			// Params for select query
			var selectUrlParam = $"$select={selectQueryColumns}";

			// Params for select query
			var filterUrlParam = $"$filter={Constant.baseIdColumnName} eq {baseRowGuid} and {Constant.isLatestColumnName} eq '{Constant.IsLatestTrue}'";

			UriBuilder requestUri = new UriBuilder("https", dataverseConfig.Value.ApiBaseUrl);
			requestUri.Path = tableName;
			requestUri.Query = $"{selectUrlParam}&{filterUrlParam}";

			var response = await dataverseClient.GetAsync(requestUri.Uri);

			if (!response.IsSuccessStatusCode)
			{
				throw new DataverseException(Constant.InvalidUpdateDataColumns);
			}

			// All current records
			var responseString = await response.Content.ReadAsStringAsync();

			// Dataverse get response model
			var responseJson = DataverseGetResponse.FromJson(responseString);

			var values = responseJson.Values;

			// There should be exactly one row with {isLatestColumnNameName} = 1
			if (values.Count != 1)
			{
				throw new DataverseException(Constant.InvalidUpdateDataColumns);
			}

			var firstValue = values[0];

			var oldStringGuid = Convert.ToString(firstValue[idColumn], cultureInfo);

			// 1. Mark existing record as old. Passing the record's GUID to be marked as old
			// 2. Insert updated record as new
			await BatchUpdate(oldStringGuid, baseRowGuid, newDataRow, tableName);
		}

		/// <summary>
		/// Insert new row and set baseId and isLatest
		/// </summary>
		/// <returns>
		/// Task
		/// </returns>
		public async Task AddNewRow(dynamic newData, string tableName, string idColumn)
		{
			// Get account id for insert Lead
			if (tableName == Constant.TableNameLeads)
			{
				// Get id for the given account name, or create new account and get its id
				string accountId = await GetOrGenerateId(Constant.TableNameAccounts, "name", newData.ParentAccountName, "parentaccountid", Constant.TableIdColumnAccounts);
				if (accountId is null)
				{
					throw new DataverseException(Constant.InvalidInsertDataColumns);
				}

				// remove name and add id
				newData.ParentAccountName = null;
				newData.ParentAccountforlead = $"{Constant.TableNameAccounts}({accountId})";
			}

			newData.Baseid = null;
			newData.Islatest = Constant.IsLatestTrue;   // Mark latest row as "1"

			var jsonTable = JsonConvert.SerializeObject(newData);
			var content = new StringContent(jsonTable, Encoding.UTF8, "application/json");

			// Add "Prefer" header to return the inserted row
			dataverseClient.DefaultRequestHeaders.Add("Prefer", "return=representation");

			UriBuilder requestUri = new UriBuilder("https", dataverseConfig.Value.ApiBaseUrl);
			requestUri.Path = tableName;

			var response = await dataverseClient.PostAsync(requestUri.Uri, content);

			if (!response.IsSuccessStatusCode)
			{
				throw new DataverseException(Constant.InvalidInsertDataColumns);
			}

			// Parse row guid from insert response
			var responseString = await response.Content.ReadAsStringAsync();

			// Create JSON for update baseid operation i.e. set baseId = rowGuid of inserted row
			var table = new DataverseTable();

			// Set baseid with id column's value of inserted row
			switch (tableName)
			{
				case Constant.TableNameActivities:
					table.Baseid = Activities.FromJson(responseString).Id;
					break;
				case Constant.TableNameOpportunities:
					table.Baseid = Opportunities.FromJson(responseString).Id;
					break;
				case Constant.TableNameLeads:
					table.Baseid = Leads.FromJson(responseString).Id;
					break;
				case Constant.TableNameAccounts:
					table.Baseid = Accounts.FromJson(responseString).Id;
					break;
				default:
					throw new DataverseException(Constant.InvalidTable);
			}

			jsonTable = JsonConvert.SerializeObject(table);
			content = new StringContent(jsonTable, Encoding.UTF8, "application/json");

			// Update operation
			requestUri = new UriBuilder("https", dataverseConfig.Value.ApiBaseUrl);
			requestUri.Path = $"{tableName}({table.Baseid})";

			response = await dataverseClient.PatchAsync(requestUri.Uri, content);

			if (!response.IsSuccessStatusCode)
			{
				throw new DataverseException(Constant.InvalidInsertDataColumns);
			}
		}

		/// <summary>
		/// Combines multiple requests into a batch to make these requests atomic, i.e. all req rollback if one fails
		///	Refer: https://docs.microsoft.com/en-us/powerapps/developer/common-data-service/webapi/execute-batch-operations-using-web-api
		/// </summary>
		/// <returns>
		/// Task
		/// </returns>
		public async Task BatchUpdate(string rowGuid, string baseId, dynamic newData, string tableName)
		{
			var batchId = $"batch_batchid";
			var changesetId = $"changeset_changesetid";

			var dataverseRequests = new DataverseBatchRequest[2];

			// Custom Update
			// 1. Mark old
			var updateTable = new DataverseTable();
			updateTable.Islatest = Constant.IsLatestFalse;
			var updateTableJson = JsonConvert.SerializeObject(updateTable);

			dataverseRequests[0] = new DataverseBatchRequest("PATCH", $"https://{dataverseConfig.Value.ApiBaseUrl}/{tableName}({rowGuid})", updateTableJson);

			// 2. Insert row
			newData.Baseid = baseId;
			newData.Islatest = Constant.IsLatestTrue;   // Mark latest row as "1"
			var newDataJson = JsonConvert.SerializeObject(newData);

			dataverseRequests[1] = new DataverseBatchRequest("POST", $"https://{dataverseConfig.Value.ApiBaseUrl}/{tableName}", newDataJson);

			// Build MultipartRequest content
			var reqContent = MultipartHelper.GenerateAtomicRequestContent(batchId, changesetId, dataverseRequests);

			dataverseClient.DefaultRequestHeaders.Accept.Clear();

			UriBuilder requestUri = new UriBuilder("https", dataverseConfig.Value.ApiBaseUrl);
			requestUri.Path = "$batch";

			// Execute Batch request
			var response = await dataverseClient.PostAsync(requestUri.Uri, reqContent);

			if (!response.IsSuccessStatusCode)
			{
				throw new DataverseException(Constant.InvalidUpdateDataColumns);
			}
		}

		/// <summary>
		/// Update existing data row
		///  1. Get guid of row with given baseId and isLatestColumnName 1
		///  2. Create batch request for the 3 operations
		/// </summary>
		/// <returns>
		/// Task
		/// </returns>
		public async Task UpdateAddData(
			string baseRowGuid,
			dynamic updatedData,
			string updateTableName,
			string updateTableIdColumn,
			dynamic newData,
			string addTableName,
			string addTableIdColumn)
		{
			// 1. Get guid of row with given baseId and isLatestColumnName 1
			string[] requiredColumns = { updateTableIdColumn, Constant.baseIdColumnName, Constant.isLatestColumnName };

			// Select parameter in Dataverse API accepts comma separated column names
			var selectQueryColumns = string.Join(",", requiredColumns);

			// Params for select query
			var selectUrlParam = $"$select={selectQueryColumns}";

			// Params for select query
			var filterUrlParam = $"$filter={Constant.baseIdColumnName} eq {baseRowGuid} and {Constant.isLatestColumnName} eq '{Constant.IsLatestTrue}'";

			UriBuilder requestUri = new UriBuilder("https", dataverseConfig.Value.ApiBaseUrl);
			requestUri.Path = updateTableName;
			requestUri.Query = $"{selectUrlParam}&{filterUrlParam}";

			var response = await dataverseClient.GetAsync(requestUri.Uri);

			if (!response.IsSuccessStatusCode)
			{
				throw new DataverseException(Constant.InvalidUpdateDataColumns);
			}

			// All current records
			var responseString = await response.Content.ReadAsStringAsync();

			// Dataverse get response model
			var responseJson = DataverseGetResponse.FromJson(responseString);

			var values = responseJson.Values;

			// There should be exactly one row with {isLatestColumnNameName} == 1
			if (values.Count != 1)
			{
				throw new DataverseException(Constant.InvalidUpdateDataColumns);
			}

			var firstValue = values[0];

			var oldStringGuid = Convert.ToString(firstValue[updateTableIdColumn], cultureInfo);

			// 2. Create batch request for the 3 operations
			await BatchUpdateAdd(oldStringGuid, baseRowGuid, updatedData, updateTableName, newData, addTableIdColumn, addTableName);
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
			string updateTableName,
			dynamic newData,
			string newDataIdColumn,
			string addTableName)
		{
			var batchId = $"batch_batchid";
			var changesetId = $"changeset_changesetid";

			var dataverseRequests = new DataverseBatchRequest[3];

			// 1a. Mark old (Custom Update)
			var updateTable = new DataverseTable();
			updateTable.Islatest = Constant.IsLatestFalse;
			string jsonTestTable = JsonConvert.SerializeObject(updateTable);

			dataverseRequests[0] = new DataverseBatchRequest("PATCH", $"https://{dataverseConfig.Value.ApiBaseUrl}/{updateTableName}({rowGuid})", jsonTestTable);

			// 1b. Insert updated row
			updatedData.Baseid = baseId;
			updatedData.Islatest = Constant.IsLatestTrue;   // Mark latest row as "1"
			var updatedDataJson = JsonConvert.SerializeObject(updatedData);

			dataverseRequests[1] = new DataverseBatchRequest("POST", $"https://{dataverseConfig.Value.ApiBaseUrl}/{updateTableName}", updatedDataJson);

			// 2. Insert new row
			newData.Islatest = Constant.IsLatestTrue;   // Mark latest row as "1"
			var newDataJson = JsonConvert.SerializeObject(newData);

			// NOTE: Set preferResponse = true for atmost one API request in a batch
			var preferDataResponse = true;
			dataverseRequests[2] = new DataverseBatchRequest("POST", $"https://{dataverseConfig.Value.ApiBaseUrl}/{addTableName}", newDataJson, preferDataResponse);

			// Build MultipartRequest content
			var reqContent = MultipartHelper.GenerateAtomicRequestContent(batchId, changesetId, dataverseRequests);

			dataverseClient.DefaultRequestHeaders.Accept.Clear();

			UriBuilder requestUri = new UriBuilder("https", dataverseConfig.Value.ApiBaseUrl);
			requestUri.Path = "$batch";

			// Execute Batch request
			var response = await dataverseClient.PostAsync(requestUri.Uri, reqContent);

			if (!response.IsSuccessStatusCode)
			{
				throw new DataverseException(Constant.InvalidUpdateDataColumns);
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
			var insertedRowGuid = Convert.ToString(insertedRow[newDataIdColumn], cultureInfo);

			// Create JSON for update operation i.e. set baseId = rowGuid of inserted row
			var table = new DataverseTable();
			table.Baseid = insertedRowGuid;

			var jsonTable = JsonConvert.SerializeObject(table);
			var content = new StringContent(jsonTable, Encoding.UTF8, "application/json");

			// Update operation
			requestUri = new UriBuilder("https", dataverseConfig.Value.ApiBaseUrl);
			requestUri.Path = $"{addTableName}({insertedRowGuid})";

			response = await dataverseClient.PatchAsync(requestUri.Uri, content);

			if (!response.IsSuccessStatusCode)
			{
				throw new DataverseException(Constant.InvalidUpdateDataColumns);
			}
		}

		/// <summary>
		/// Gets values in the given table with given select and filter params
		/// </summary>
		/// <returns>
		/// Returns list of values which match the given parameters
		/// </returns>
		public async Task<JArray> GetValues(string tableName, string[] selectColumns, string filterUrlParam)
		{
			// Select parameter in Dataverse API accepts comma separated column names
			var selectQueryColumns = string.Join(",", selectColumns);

			// Params for select query
			var selectUrlParam = $"$select={selectQueryColumns}";

			UriBuilder requestUri = new UriBuilder("https", dataverseConfig.Value.ApiBaseUrl);
			requestUri.Path = tableName;
			requestUri.Query = $"{selectUrlParam}&$filter={filterUrlParam}";

			var response = await dataverseClient.GetAsync(requestUri.Uri);

			if (!response.IsSuccessStatusCode)
			{
				throw new DataverseException(Constant.InvalidInsertDataColumns);
			}

			// Parse response
			var responseString = await response.Content.ReadAsStringAsync();

			// Dataverse get response model
			var responseJson = DataverseGetResponse.FromJson(responseString);

			return responseJson.Values;
		}

		/// <summary>
		/// Generates a new Id in the given table if does not exist already
		///	Inserts a new row when given row does not exist and returns the Id of the newly inserted row
		///	https://docs.microsoft.com/en-us/powerapps/developer/common-data-service/webapi/retrieve-table-using-web-api#retrieve-using-an-alternate-key
		/// </summary>
		/// <returns>
		/// Returns Id of given queryColumnValue parameter
		/// </returns>
		public async Task<string> GetOrGenerateId(string queryTableName, string queryColumnName, string queryColumnValue, string selectIdColumnName, string getIdColumnName)
		{
			var values = await GetValues(queryTableName, new string[] { selectIdColumnName }, $"{queryColumnName} eq '{queryColumnValue}'");

			// Check if columnValue already exists in table
			if (values != null && values.Count > 0)
			{
				// Return the id of first match
				return Convert.ToString(values[0][getIdColumnName], cultureInfo);
			}

			// An existing row not found, insert new row

			// New row's data
			// Note: We are creating a JObject as queryColumnName is dynamic
			var insertObject = new JObject();
			insertObject[queryColumnName] = queryColumnValue;

			// Add row creation date property
			insertObject[Constant.RowCreationDateColumnName] = DateTime.UtcNow.ToString(Constant.DataverseDateFormat);

			var insertObjectJson = JsonConvert.SerializeObject(insertObject);
			var reqContent = new StringContent(insertObjectJson, Encoding.UTF8, "application/json");

			// Add "Prefer" header to return the inserted row
			dataverseClient.DefaultRequestHeaders.Add("Prefer", "return=representation");

			UriBuilder requestUri = new UriBuilder("https", dataverseConfig.Value.ApiBaseUrl);
			requestUri.Path = queryTableName;

			var response = await dataverseClient.PostAsync(requestUri.Uri, reqContent);

			if (!response.IsSuccessStatusCode)
			{
				throw new DataverseException(Constant.InvalidInsertDataColumns);
			}

			// Parse response
			var responseString = await response.Content.ReadAsStringAsync();

			// Return id column's value of inserted row
			switch (queryTableName)
			{
				case Constant.TableNameActivities:
					return Activities.FromJson(responseString).Id;
				case Constant.TableNameOpportunities:
					return Opportunities.FromJson(responseString).Id;
				case Constant.TableNameLeads:
					return Leads.FromJson(responseString).Id;
				case Constant.TableNameAccounts:
					return Accounts.FromJson(responseString).Id;
				default:
					throw new DataverseException(Constant.InvalidTable);
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
			newData.RowCreationDate = currentDate.ToString(Constant.DataverseDateFormat);
		}
	}
}
