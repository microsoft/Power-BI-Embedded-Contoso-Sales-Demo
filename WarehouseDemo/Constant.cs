// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

public class Constant
{
	// Used as key for reading Key Vault items from Configuration
	public const string Certificate = "NewFieldDemoCertificate";
	public const string SigningKey = "TokenSigningKey";
	public const string SalesManagerUsername = "SalesManagerUsername";
	public const string SalesManagerPassword = "SalesManagerPassword";
	public const string SalesPersonUsername = "SalesPersonUsername";
	public const string SalesPersonPassword = "SalesPersonPassword";

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

	// Used while setting or checking for roles
	public const string SalesPersonRole = "Sales Person";
	public const string SalesManagerRole = "Sales Manager";
}
