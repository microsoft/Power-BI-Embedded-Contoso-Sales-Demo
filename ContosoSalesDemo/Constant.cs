// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

public class Constant
{
	// Used as key for reading Key Vault items from Configuration
	public const string SalesManagerUsername = "SalesManagerUsername";
	public const string SalesManagerPassword = "SalesManagerPassword";
	public const string SalesPersonUsername = "SalesPersonUsername";
	public const string SalesPersonPassword = "SalesPersonPassword";
	public const string AppInsightsInstrumentationKey = "AppInsightsInstrumentationKey";

	// Used while fetching AAD token
	public const string PowerBiScope = "https://analysis.windows.net/powerbi/api/.default";

	// Used for naming policies
	public const string GeneralUserPolicyName = "GeneralUser";
	public const string FieldUserPolicyName = "FieldUser";

	// Used to renew AAD token minutes before expiry
	public const int RenewBeforeMinutes = 10;

	// Used to remove cached values after days of inactivity
	public const int ExpireInDays = 7;

	// Used to create Power BI HTTP client
	public const string PowerBiApiUri = "https://api.powerbi.com";

	// Used to check the file format of export file
	public const string PDF = "PDF";
	public const string PPT = "PPT";
	public const string PNG = "PNG";

	// Used as media type while returning exported file
	public const string MimeTypePdf = "application/pdf";
	public const string MimeTypePptx = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
	public const string MimeTypePng = "image/png";

	// Used to set the name of exported file
	public const string ExportFileName = "Exported";

	// Used for setting locale for exporting
	public const string DefaultLocale = "en-us";

	// Used while polling for report export status
	public const int ExportTimeoutInMinutes = 10;

	// Used for returning error message during export parameters validation failure
	public const string MissingPageName = "Provide a valid page name";
	public const string MissingFileFormat = "Provide a valid file format";

	// Used for returning error message during basic auth
	public const string InvalidUsernamePassword = "Invalid username or password";
	public const string InvalidRole = "Invalid role";
	public const string InvalidAccessToken = "Invalid access token";

	// Used for returning error message in CDS service
	public const string InvalidRequest = "Invalid request parameters";

	// Used while setting or checking for roles
	public const string SalesPersonRole = "Sales Person";
	public const string SalesManagerRole = "Sales Manager";

	// Note: These entity names should match the entity names in CDS
	// CDS entity names
	// Used for CDS API calls
	public const string EntityNameActivities = "crcb2_activitieses";
	public const string EntityNameOpportunities = "opportunities";
	public const string EntityNameLeads = "leads";
	public const string EntityNameAccounts = "accounts";

	// CDS entity's id-field names
	// Used for CDS API calls
	public const string isLatestFieldName = "crcb2_islatest";
	public const string baseIdFieldName = "crcb2_baseid";
	public const string RowCreationDateFieldName = "crcb2_rowcreationdate";
	public const string EntityIdFieldActivities = "crcb2_activitiesid";
	public const string EntityIdFieldOpportunities = "opportunityid";
	public const string EntityIdFieldLeads = "leadid";
	public const string EntityIdFieldAccounts = "accountid";

	// CDS constants
	// Used for setting date in Date Only type fields
	public const string IsLatestTrue = "1";
	public const string IsLatestFalse = "0";
	public const string CdsDateFormat = "yyyy-MM-dd";

	// Used for returning error message for CDS apis
	public const string InvalidReq = "Invalid request parameters";
	public const string InvalidEntity = "Invalid entity name";
	public const string InvalidUpdateDataFields = "Invalid update fields";
	public const string InvalidInsertDataFields = "Invalid insert fields";
	public const string DataParsingFailed = "Invalid input provided in form";
}
