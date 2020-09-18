// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import { TabConfig, TabName } from './models';

/**
 * List of tabs for sales person
 */
export const salesPersonTabs: TabConfig[] = [
	{
		name: TabName.Home,
		reportPageName: '',
	},
	{
		name: TabName.Leads,
		reportPageName: '',
	},
	{
		name: TabName.Opportunities,
		reportPageName: '',
	},
	{
		name: TabName.Accounts,
		reportPageName: '',
	},
	{
		name: TabName.MyActivities,
		reportPageName: '',
	},
];

/**
 * List of tabs for sales manager
 */
export const salesManagerTabs: TabConfig[] = [
	{
		name: TabName.Home,
		reportPageName: '',
	},
	{
		name: TabName.Sellers,
		reportPageName: '',
	},
	{
		name: TabName.Accounts,
		reportPageName: '',
	},
	{
		name: TabName.Analytics,
		reportPageName: '',
	},
];

/**
 * Pairs of visuals to be grouped together in the custom layout
 * Format: ['main visual guid', 'overlapping visual guid']
 */
// Add guids of visuals to be paired in custom layout
export const visualPairs = [['', '']];

/**
 * Commands:
 * Visual commands to edit leads and opportunities
 * Guid values of visuals on which the context menu should show up
 */
export const visualCommands = {
	editLeads: {
		name: 'EditLeads',
		displayName: 'Edit Lead',
		visualGuid: '',
	},
	editOpportunity: {
		name: 'EditOpportunities',
		displayName: 'Edit Opportunity',
		visualGuid: '',
	},
};

/**
 * Title of Power BI buttons on which custom action is to be set
 */
export const visualButtons = {
	addLeadButtonGuid: '',
};
