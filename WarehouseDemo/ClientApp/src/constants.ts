// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

/**
 * SalesPerson details
 */
export const SalesPerson = {
	profileImageName: 'salesperson-profile',
};

/**
 * SalesManager details
 */
export const SalesManager = {
	profileImageName: 'salesmanager-profile',
};

/**
 * Anonymous user details
 */
export const AnonymousUser = {
	profileImageName: 'anonymous-profile',
};

/**
 * Link to the Power BI visual selector schema
 */
export const visualSelectorSchema = 'http://powerbi.com/product/schema#visualSelector';

/**
 * Export parameters: Name of the exported file and
 * URL of server side API for exporting
 */
export const exportedFileName = 'ExportedFile';

/**
 * Types of export supported in Power BI Embedded
 */
export const exportTypes: Array<string> = ['pdf', 'ppt', 'png'];

/**
 * Margin around each visual
 */
export const visualMargin = 20;

/**
 * Left right margin around report page
 */
export const ReportMargin = 10;

/**
 * Aspect ratio of all visuals
 */
export const visualAspectRatio = 9 / 16;

/**
 * Ratio of height of Overlap visual and Main visual
 */
export const overlapVisualHeightRatio = 1 / 4;

// Section means a single unit that will be repeating as pattern to form the layout
// These 2 variables are used for the 2 custom layouts with spanning
/**
 * Row is the max number of visuals in any column of a section (repeating unit)
 */
export const rowsPerSpanTypeSection = 2;

/**
 * Number of visuals in a section (repeating unit)
 */
export const visualsPerSpanTypeSection = 3;

/**
 * Names of tabs in edit opportunity popup
 */
export const opportunityPopupTabNames = ['Edit Topic', 'Schedule a Meeting', 'Quote', 'Set Status'];

/**
 * Names of tabs in edit lead popup
 */
export const editLeadPopupTabNames = ['Add Activity', 'Qualify Lead', 'Disqualify Lead'];

/**
 * Name of the application
 */
export const appName = 'Contoso';

/**
 * Session storage key for stored JWT token
 */
export const storageKeyJWT = 'jwt';

/**
 * Key for token expiry time in JWT token's payload
 */
export const tokenExpiryKey = 'exp';

/**
 * Error message to be displayed against invalid user input
 */
export const formInputErrorMessage = 'Please provide a valid value';

/**
 * Embed token to be refreshed before expiration
 */
export const minutesToRefreshBeforeExpiration = 2;
