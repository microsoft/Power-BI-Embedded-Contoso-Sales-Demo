// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Controllers
{
	using ContosoSalesDemo.Exceptions;
	using ContosoSalesDemo.Models;
	using ContosoSalesDemo.Service;
	using Microsoft.AspNetCore.Authorization;
	using Microsoft.AspNetCore.Mvc;
	using Microsoft.Extensions.Logging;
	using Microsoft.Identity.Client;
	using Newtonsoft.Json;
	using System;
	using System.Net;
	using System.Threading.Tasks;

	[ApiController]
	[Route("[controller]")]
	[Authorize(Policy = Constant.FieldUserPolicyName)]
	public class DataverseController : ControllerBase
	{
		private readonly DataverseService dataverseService;
		private readonly ILogger<DataverseController> logger;

		public DataverseController(DataverseService dataverseService, ILogger<DataverseController> logger)
		{
			this.dataverseService = dataverseService;
			this.logger = logger;
		}

		[HttpPut("/api/data/update")]
		public async Task<IActionResult> UpdateData([FromBody] UpdateDataRequest reqBody)
		{
			try
			{
				var updateTableName = reqBody.UpdateTableType;

				// Parse row's data from Json in request as an instance of Activity/Opportunities/Leads
				var (idColumn, newData) = dataverseService.ParseDataRowFromJson(reqBody.UpdatedData, updateTableName);

				// Set current UTC date in the RowCreationDate column
				dataverseService.SetRowCreationDate(newData);

				// Check if parsing was successful
				if (newData is null)
				{
					return BadRequest(Constant.InvalidReq);
				}

				// Update the given data in Dataverse
				await dataverseService.UpdateData(reqBody.BaseId, newData, idColumn, updateTableName);

				return Ok();
			}
			catch (JsonException ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.BadRequest, Constant.DataParsingFailed);
			}
			catch (DataverseException ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.BadRequest, ex.Message);
			}
			catch (MsalServiceException ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode(ex.StatusCode, ex.Message);
			}
			catch (MsalClientException ex)
			{
				logger.LogError(ex, ex.Message);
				if (Int32.TryParse(ex.ErrorCode, out int errorCode))
				{
					return StatusCode(errorCode, ex.Message);
				}
				else
				{
					return StatusCode(403, ex.Message);
				}
			}
			// Handling generic exception to prevent sending complete stack trace to client side
			catch (Exception ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.InternalServerError);
			}
		}

		[HttpPost("/api/data/add")]
		public async Task<IActionResult> AddNewData([FromBody] AddDataRequest reqBody)
		{
			try
			{
				var addTableName = reqBody.AddTableType;

				// Parse row's data from Json in request as an instance of Activity/Opportunities/Leads
				var (idColumn, newData) = dataverseService.ParseDataRowFromJson(reqBody.NewData, addTableName);

				// Set current UTC date in the RowCreationDate column
				dataverseService.SetRowCreationDate(newData);

				// Check if parsing was successful
				if (newData is null)
				{
					return BadRequest(Constant.InvalidReq);
				}

				// Insert the given data in Dataverse, baseId is null as it is not known at time of insert
				await dataverseService.AddNewRow(newData, addTableName, idColumn);

				return Ok();
			}
			catch (JsonException ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.BadRequest, Constant.DataParsingFailed);
			}
			catch (DataverseException ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.BadRequest, ex.Message);
			}
			catch (MsalServiceException ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode(ex.StatusCode, ex.Message);
			}
			catch (MsalClientException ex)
			{
				logger.LogError(ex, ex.Message);
				if (Int32.TryParse(ex.ErrorCode, out int errorCode))
				{
					return StatusCode(errorCode, ex.Message);
				}
				else
				{
					return StatusCode(403, ex.Message);
				}
			}
			// Handling generic exception to prevent sending complete stack trace to client side
			catch (Exception ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.InternalServerError);
			}
		}

		[HttpPost("/api/data/update-add")]
		public async Task<IActionResult> UpdateAddNewData([FromBody] AddAndUpdateDataRequest reqBody)
		{
			try
			{
				var addTableName = reqBody.AddReqBody.AddTableType;

				// Parse row's data from Json in request as an instance of Activity/Opportunities/Leads for add operation
				var (addTableIdColumn, newData) = dataverseService.ParseDataRowFromJson(reqBody.AddReqBody.NewData, addTableName);

				// Set current UTC date in the RowCreationDate column
				dataverseService.SetRowCreationDate(newData);

				var updateTableName = reqBody.UpdateReqBody.UpdateTableType;

				// Parse row's data from Json in request as an instance of Activity/Opportunities/Leads for update operation
				var (updateTableIdColumn, updatedData) = dataverseService.ParseDataRowFromJson(reqBody.UpdateReqBody.UpdatedData, updateTableName);

				// Set current UTC date in the RowCreationDate column
				dataverseService.SetRowCreationDate(updatedData);

				// Check if both parsing were successful
				if (newData is null || updatedData is null)
				{
					return BadRequest(Constant.InvalidReq);
				}

				// Insert the given data in Dataverse, baseId is null as it is not known at time of insert
				await dataverseService.UpdateAddData(reqBody.UpdateReqBody.BaseId, updatedData, updateTableName, updateTableIdColumn, newData, addTableName, addTableIdColumn);

				return Ok();
			}
			catch (JsonException ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.BadRequest, Constant.DataParsingFailed);
			}
			catch (DataverseException ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.BadRequest, ex.Message);
			}
			catch (MsalServiceException ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode(ex.StatusCode, ex.Message);
			}
			catch (MsalClientException ex)
			{
				logger.LogError(ex, ex.Message);
				if (Int32.TryParse(ex.ErrorCode, out int errorCode))
				{
					return StatusCode(errorCode, ex.Message);
				}
				else
				{
					return StatusCode(403, ex.Message);
				}
			}
			// Handling generic exception to prevent sending complete stack trace to client side
			catch (Exception ex)
			{
				logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.InternalServerError);
			}
		}
	}
}
