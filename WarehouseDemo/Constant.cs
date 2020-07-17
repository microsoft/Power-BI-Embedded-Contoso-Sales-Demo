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
}