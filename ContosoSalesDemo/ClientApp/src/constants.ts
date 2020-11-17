// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

/**
 * Salesperson details
 */
export const Salesperson = {
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
export const reportMargin = 0;

/**
 * Width of filter pane
 */
export const FilterPaneWidth = 32;

/**
 * Extra space around embedded report
 */
export const ExtraEmbeddingMargin = 24;

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
 * Entity names on which the operations are to be performed
 */
export const entityNameActivities = 'crcb2_activitieses';
export const entityNameOpportunities = 'opportunities';
export const entityNameLeads = 'leads';

/**
 * Leads entity rating options with corresponding values in CDS
 */
export const ratingOptionsSet = { Hot: 1, Warm: 2, Cold: 3 };

/**
 * Activity type options with corresponding values in CDS
 */
export const activityTypeOptions = {
	Appointment: 712800000,
	Email: 712800001,
	'Phone Call': 712800002,
	Task: 712800003,
};

/**
 * Opportunity status options with corresponding values in CDS
 */
export const opportunityStatus = [
	{
		id: 'new',
		value: 'New',
		checked: true,
		code: 712800004,
	},
	{
		id: 'meetingScheduled',
		value: 'Meeting Scheduled',
		checked: false,
		code: 712800003,
	},
	{
		id: 'quoteSent',
		value: 'Quote Sent',
		checked: false,
		code: 712800002,
	},
	{
		id: 'closedWon',
		value: 'Closed Won',
		checked: false,
		code: 712800000,
	},
	{
		id: 'closedLost',
		value: 'Closed Lost',
		checked: false,
		code: 712800001,
	},
];

/**
 * Opportunity sales stage options with corresponding values in CDS
 */
export const opportunitySalesStage = {
	Qualify: 712800000,
	Develop: 712800002,
	Propose: 712800003,
	Closed: 712800001,
};

/**
 * Lead status options with corresponding values in CDS
 */
export const leadStatus = { New: 712800000, Qualified: 712800001, Disqualified: 712800002 };

/**
 * Activity priority options with corresponding values in CDS
 */
export const activityPriorityOptions = { Low: 712800000, Normal: 712800001, High: 712800002 };

/**
 * Leads entity source options with corresponding values in CDS
 */
export const sourceOptionsSet = {
	Advertisement: 1,
	'Employee Referral': 2,
	'External Referral': 3,
	Partner: 4,
	'Public Relations': 5,
	Seminar: 6,
	'Trade Show': 7,
	Web: 8,
	'Word of Mouth': 9,
	Other: 10,
};

/**
 * Name of the application
 */
export const appName = 'Contoso';

/**
 * Session storage key for stored theme state
 */
export const storageKeyTheme = 'themeState';

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
 * Error message to be displayed when anonymous user tries to perform write-back operations
 */
export const AnonymousWritebackMessage = 'Anonymous user cannot perform Add Lead write-back operation';

/**
 * Error message to be displayed when user report refresh fails due to 15 sec limit
 */
export const WritebackRefreshFailMessage = 'It may take up to 15 sec for the data to refresh';

/**
 * Embed token to be refreshed before expiration
 */
export const minutesToRefreshBeforeExpiration = 2;
