// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

public class Constant
{
	// Used as key for storing certificate in cache
	public const string Certificate = "Certificate";

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
}
