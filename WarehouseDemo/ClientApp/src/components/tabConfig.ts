// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

/**
 * Config for tabs in EmbedPage
 *
 * Get reportPageName from the report's URL
 * https://app.powerbi.com/groups/GroupId/reports/ReportId/ReportPageName
 */
export interface TabConfig {
	name: string;
	reportPageName: string;
}

/**
 * Names of all tabs
 */
export enum TabName {
	Home = 'Home',
	Leads = 'Leads',
	Opportunities = 'Opportunities',
	Accounts = 'Accounts',
	MyActivities = 'My Activities',
	Sellers = 'Sellers',
	Analytics = 'Analytics',
}

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
