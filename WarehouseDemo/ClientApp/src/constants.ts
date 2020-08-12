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
 * Commands:
 * Visual commands to edit leads and opportunities
 * Button action to add a new lead
 */
export const visualCommands = {
	editLeads: {
		name: 'EditLeads',
		displayName: 'Edit Leads',
		visualGuid: 'af17cf8ee4edb070965c',
	},
	editOpportunity: {
		name: 'EditOpportunities',
		displayName: 'Edit Opportunities',
		visualGuid: 'deec664ea882e0097381',
	},
};

export enum visualButtons {
	addLeadsTitle = 'Add Lead',
	addActivityTitle = 'Add Activity',
}

export const visualSelectorSchema = 'http://powerbi.com/product/schema#visualSelector';

/**
 * Export parameters: Name of the exported file and
 * URL of server side API for exporting
 */
export const exportedFileName = 'ExportedFile';
export const exportServerApi = '/api/powerbi/ExportReport';

/**
 * Types of export supported in Power BI Embedded
 */
export const exportTypes: Array<string> = ['pdf', 'ppt', 'png'];

/**
 * Content type used to convert the file stream to required file format
 */
export enum contentTypeMapping {
	PDF = 'application/pdf',
	PPT = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	PNG = 'image/png',
}

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

/**
 * CSS Class to show the report-container
 */
export const visibleClass = 'report-visible';

/**
 * CSS class to hide the report-container
 */
export const hiddenClass = 'report-hidden';

/**
 * Error message to be displayed against invalid user input
 */
export const formInputErrorMessage = 'Please provide a valid value';
