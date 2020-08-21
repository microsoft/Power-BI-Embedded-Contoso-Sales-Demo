// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import { models } from 'powerbi-client';
import { IVisualNode } from 'visualDescriptor';

/**
 * Shape for the response from server end point _ServiceAPI.FetchEmbedParams_
 */
export interface EmbedParamsResponse {
	Id: string;
	EmbedUrl: string;
	Type: string;
	EmbedToken: {
		Token: string;
		TokenId: string;
		Expiration: string;
	};
	DefaultPage: string | null;
	MobileDefaultPage: string | null;
}

export interface Bookmark extends models.IReportBookmark {
	checked?: boolean;
}

export interface AddActivityFormData {
	topic: string;
	accountName: string;
	contactFullName: string;
	subject: string;
	dueDate: string;
	priority: string;
	activityType: string;
	description: string;
}

export interface AddLeadFormData {
	accountName: string;
	contactFullName: string;
	topic: string;
	rating: string;
	source: string;
	createdOn: string;
}

export interface EditLeadFormData {
	accountName: string;
	contactFullName: string;
	topic: string;
	activityType: string;
	subject: string;
	priority: string;
	description: string;
	dueDate: string;
	estimatedRevenue: string;
	estimatedCloseDate: string;
}

export interface UpdateOpportunityFormData {
	topic: string;
	title: string;
	accountName: string;
	contactFullName: string;
	fullName: string;
	startDate: string;
	endDate: string;
	startTime: string;
	endTime: string;
	estimatedRevenue: string;
	currentQuote: string;
	editQuote: string;
	opportunityStatus: string;
	description: string;
}

/**
 * Shape for the response from service end point _ServiceAPI.Authenticate_
 */
export interface AuthResponse {
	access_token: string;
	expiration_time?: string;
}

export interface Tab {
	readonly name: string;
	readonly isActive: boolean;
}

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

export interface VisualGroup {
	mainVisual: IVisualNode;
	overlapVisual?: IVisualNode;
	checked: boolean;
}

export enum ModalTab {
	Bookmark = 'bookmark',
	Export = 'export',
}

export enum Layout {
	oneColumnLayout,
	twoColumnLayout,
	threeColumnLayout,
	twoColumnColspanLayout,
	twoColumnRowspanLayout,
}

export interface LayoutMapping {
	spanType: SpanType;
	columns: number;
}

export enum SpanType {
	None = 0,
	RowSpan = 1,
	ColSpan = 2,
}

export enum LayoutColumns {
	One = 1,
	Two = 2,
	Three = 3,
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

export enum Profile {
	SalesPerson = 'Sales Person',
	SalesManager = 'Sales Manager',
}

export enum Theme {
	Light = 'light',
	Dark = 'dark',
}

/**
 * Content type used to convert the file stream to required file format
 */
export enum contentTypeMapping {
	PDF = 'application/pdf',
	PPT = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	PNG = 'image/png',
}

/**
 * API end-points for backend service
 */
export enum ServiceAPI {
	Authenticate = '/api/auth/token',
	FetchEmbedParams = '/api/powerbi/EmbedParams',
	ExportReport = '/api/powerbi/ExportReport',
}
