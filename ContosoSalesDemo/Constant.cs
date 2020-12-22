// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

public class Constant
{
	// Used as key for reading Key Vault items from Configuration
	public const string SalesManagerUsername = "SalesManagerUsername";
	public const string SalesManagerPassword = "SalesManagerPassword";
	public const string SalespersonUsername = "SalespersonUsername";
	public const string SalespersonPassword = "SalespersonPassword";
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

	// Used for returning error message in Dataverse service
	public const string InvalidRequest = "Invalid request parameters";

	// Used while setting or checking for roles
	public const string SalespersonRole = "Salesperson";
	public const string SalesManagerRole = "Sales Manager";

	// Note: These table names should match the table names in Dataverse
	// Dataverse table names
	// Used for Dataverse API calls
	public const string TableNameActivities = "crcb2_activitieses";
	public const string TableNameOpportunities = "opportunities";
	public const string TableNameLeads = "leads";
	public const string TableNameAccounts = "accounts";

	// Dataverse table's id-column names
	// Used for Dataverse API calls
	public const string isLatestColumnName = "crcb2_islatest";
	public const string baseIdColumnName = "crcb2_baseid";
	public const string RowCreationDateColumnName = "crcb2_rowcreationdate";
	public const string TableIdColumnActivities = "crcb2_activitiesid";
	public const string TableIdColumnOpportunities = "opportunityid";
	public const string TableIdColumnLeads = "leadid";
	public const string TableIdColumnAccounts = "accountid";

	// Dataverse constants
	// Used for setting date in Date Only type columns
	public const string IsLatestTrue = "1";
	public const string IsLatestFalse = "0";
	public const string DataverseDateFormat = "yyyy-MM-dd";

	// Used for returning error message for Dataverse apis
	public const string InvalidReq = "Invalid request parameters";
	public const string InvalidTable = "Invalid table name";
	public const string InvalidUpdateDataColumns = "Invalid update columns";
	public const string InvalidInsertDataColumns = "Invalid insert columns";
	public const string DataParsingFailed = "Invalid input provided in form";
}
