// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

/**
 * SalesPerson details
 */
export const SalesPerson = {
	firstName: 'June',
	lastName: 'Smith',
	profileImageName: 'salesperson-profile.svg',
};

/**
 * SalesManager details
 */
export const SalesManager = {
	firstName: 'Donna',
	lastName: 'Paul',
	profileImageName: 'salesmanager-profile.svg',
};

/**
 * Anonymous user details
 */
export const AnonymousUser = {
	firstName: 'Anonymous',
	lastName: '',
	profileImageName: 'anonymous-profile.svg',
};

/**
 * API end-point url to get embed config for a sample report
 */
export const reportEmbedConfigUrl = '/api/powerbi/EmbedParams';

/**
 * Pairs of visuals to be grouped together in the custom layout
 * Format: ['main visual title', 'overlapping visual title']
 */
// TODO: Add titles of visuals to be paired in custom layout
export const visualPairs = [['', '']];

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
 * Alternative name for PowerBI icon
 */
export const powerBiIconAltName = 'powerbi';

/**
 * Alternative name for GitHub icon
 */
export const gitHubIconAltName = 'github';

/**
 * Name of the application
 */
export const appName = 'Contoso';
