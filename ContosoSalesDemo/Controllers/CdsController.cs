// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

namespace ContosoSalesDemo.Controllers
{
	using System;
	using System.Threading.Tasks;
	using Microsoft.Identity.Web;
	using Microsoft.Identity.Client;
	using Microsoft.AspNetCore.Mvc;
	using Microsoft.AspNetCore.Authorization;
	using Microsoft.Extensions.Logging;
	using ContosoSalesDemo.Service;
	using ContosoSalesDemo.Models;
	using ContosoSalesDemo.Exceptions;
	using System.Net;
	using Newtonsoft.Json;

	[ApiController]
	[Route("[controller]")]
	[Authorize(Policy = Constant.FieldUserPolicyName)]
	public class CdsController : ControllerBase
	{
		private readonly ITokenAcquisition TokenAcquisition;
		private readonly ILogger<CdsController> Logger;

		public CdsController(ITokenAcquisition tokenAcquisition, ILogger<CdsController> logger)
		{
			TokenAcquisition = tokenAcquisition;
			Logger = logger;
		}

		[HttpPut("/api/data/update")]
		public async Task<IActionResult> UpdateData([FromBody] UpdateDataRequest reqBody)
		{
			try
			{
				// Generate AAD token
				var aadToken = await TokenAcquisition.GetAccessTokenForAppAsync(new string[] { Constant.CdsScope });

				// Init CDS Service
				using (var cdsService = new CdsService(aadToken))
				{
					var updateEntityName = reqBody.UpdateEntityType;

					// Parse row's data from Json in request as an instance of Activity/Opportunities/Leads
					var (idField, newData) = cdsService.ParseDataRowFromJson(reqBody.UpdatedData, updateEntityName);

					// Set current UTC date in the RowCreationDate field
					cdsService.SetRowCreationDate(newData);

					// Check if parsing was successful
					if (newData is null)
					{
						return BadRequest(Constant.InvalidReq);
					}

					// Update the given data in CDS
					await cdsService.UpdateData(reqBody.BaseId, newData, idField, updateEntityName);
				};

				return Ok();
			}
			catch (JsonException ex)
			{
				Logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.BadRequest, Constant.DataParsingFailed);
			}
			catch (CdsException ex)
			{
				Logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.BadRequest, ex.Message);
			}
			catch (MsalServiceException ex)
			{
				Logger.LogError(ex, ex.Message);
				return StatusCode(ex.StatusCode, ex.Message);
			}
			catch (MsalClientException ex)
			{
				Logger.LogError(ex, ex.Message);
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
				Logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.InternalServerError);
			}
		}

		[HttpPost("/api/data/add")]
		public async Task<IActionResult> AddNewData([FromBody] AddDataRequest reqBody)
		{
			try
			{
				// Generate AAD token
				var aadToken = await TokenAcquisition.GetAccessTokenForAppAsync(new string[] { Constant.CdsScope });

				// Init CDS Service
				using (var cdsService = new CdsService(aadToken))
				{
					var addEntityName = reqBody.AddEntityType;

					// Parse row's data from Json in request as an instance of Activity/Opportunities/Leads
					var (idField, newData) = cdsService.ParseDataRowFromJson(reqBody.NewData, addEntityName);

					// Set current UTC date in the RowCreationDate field
					cdsService.SetRowCreationDate(newData);
					
					// Check if parsing was successful
					if (newData is null)
					{
						return BadRequest(Constant.InvalidReq);
					}

					// Insert the given data in CDS, baseId is null as it is not known at time of insert
					await cdsService.AddNewRow(newData, addEntityName, idField);
				}

				return Ok();
			}
			catch (JsonException ex)
			{
				Logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.BadRequest, Constant.DataParsingFailed);
			}
			catch (CdsException ex)
			{
				Logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.BadRequest, ex.Message);
			}
			catch (MsalServiceException ex)
			{
				Logger.LogError(ex, ex.Message);
				return StatusCode(ex.StatusCode, ex.Message);
			}
			catch (MsalClientException ex)
			{
				Logger.LogError(ex, ex.Message);
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
				Logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.InternalServerError);
			}
		}

		[HttpPost("/api/data/update-add")]
		public async Task<IActionResult> UpdateAddNewData([FromBody] AddAndUpdateDataRequest reqBody)
		{
			try
			{
				// Generate AAD token
				var aadToken = await TokenAcquisition.GetAccessTokenForAppAsync(new string[] { Constant.CdsScope });

				// Init CDS Service
				using (var cdsService = new CdsService(aadToken))
				{
					var addEntityName = reqBody.AddReqBody.AddEntityType;

					// Parse row's data from Json in request as an instance of Activity/Opportunities/Leads for add operation
					var (addEntityIdField, newData) = cdsService.ParseDataRowFromJson(reqBody.AddReqBody.NewData, addEntityName);

					// Set current UTC date in the RowCreationDate field
					cdsService.SetRowCreationDate(newData);

					var updateEntityName = reqBody.UpdateReqBody.UpdateEntityType;

					// Parse row's data from Json in request as an instance of Activity/Opportunities/Leads for update operation
					var (updateEntityIdField, updatedData) = cdsService.ParseDataRowFromJson(reqBody.UpdateReqBody.UpdatedData, updateEntityName);

					// Set current UTC date in the RowCreationDate field
					cdsService.SetRowCreationDate(updatedData);

					// Check if both parsing were successful
					if (newData is null || updatedData is null)
					{
						return BadRequest(Constant.InvalidReq);
					}

					// Insert the given data in CDS, baseId is null as it is not known at time of insert
					await cdsService.UpdateAddData(reqBody.UpdateReqBody.BaseId, updatedData, updateEntityName, updateEntityIdField, newData, addEntityName, addEntityIdField);
				}

				return Ok();
			}
			catch (JsonException ex)
			{
				Logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.BadRequest, Constant.DataParsingFailed);
			}
			catch (CdsException ex)
			{
				Logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.BadRequest, ex.Message);
			}
			catch (MsalServiceException ex)
			{
				Logger.LogError(ex, ex.Message);
				return StatusCode(ex.StatusCode, ex.Message);
			}
			catch (MsalClientException ex)
			{
				Logger.LogError(ex, ex.Message);
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
				Logger.LogError(ex, ex.Message);
				return StatusCode((int)HttpStatusCode.InternalServerError);
			}
		}
	}
}
