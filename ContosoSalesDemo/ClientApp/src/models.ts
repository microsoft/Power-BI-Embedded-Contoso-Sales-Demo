// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
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

// Following are the fields names of the entities in the CDS where name starting with 'crcb2' indicates custom fields
export interface Activity {
	crcb2_activitytype: number;
	crcb2_subject: string;
	crcb2_priority: number;
	crcb2_startdatetime: string;
	crcb2_enddatetime: string;
	crcb2_duedatetime: string;
	crcb2_description: string;
	crcb2_topic: string;
}

export class Lead {
	crcb2_primarycontactname: string;
	subject: string;
	leadqualitycode: number;
	leadsourcecode: number;
	crcb2_leadstatus: number;
}

export interface Opportunity {
	name: string;
	estimatedvalue: number;
	estimatedclosedate: string;
	crcb2_opportunitystatus: number;
	crcb2_salesstage: number;
	crcb2_quoteamount: number;
}

export interface EditLeadFormData {
	leadcontactfullname: string;
	leadtopic: string;
	estimatedrevenue: number;
	estimatedclosedate: Date;
}

export interface UpdateOpportunityFormData {
	title: string;
	editquote: number;
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
	Salesperson = 'Salesperson',
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
	WriteBackAdd = '/api/data/add',
	WriteBackUpdate = '/api/data/update',
	WriteBackUpdateAdd = '/api/data/update-add',
}

/**
 * Props interface for write back forms
 */
export interface FormProps {
	toggleFormPopup: { (): void };
	setError: { (error: string): void };
	updateApp: UpdateApp;
	refreshReport: { (): void };
	isWritebackInProgress: boolean;
	toggleWritebackProgressState: { (): void };
}

/**
 * App re-render state update function type
 */
export type UpdateApp = { (stateUpdateFunction: { (prevState: number): number }): void };

/**
 * Date format types
 */
export enum DateFormat {
	DayMonthDayYear = 'dddd, MMMM DD, yyyy',
	YearMonthDay = 'YYYY-MM-DD',
	YearMonthDayTime = 'YYYY-MM-DDTHH:mm:ss',
}

/**
 * CDS request interface with CDS service API endpoint, HTTP method and request body
 */
export interface CDSRequest {
	cdsServiceApi: string;
	method: string;
	body: string;
}

export interface CDSAddRequestData {
	newData: string;
	addEntityType: string;
}

export interface CDSUpdateRequestData {
	baseId: string;
	updatedData: string;
	updateEntityType: string;
}

export interface CDSUpdateAddRequestData {
	UpdateReqBody: CDSUpdateRequestData;
	AddReqBody: CDSAddRequestData;
}

interface PowerBITableField {
	name: string;
	value: string;
}

interface PowerBITableDateField {
	name: string;
	value: Date;
}

export interface OpportunityTablePowerBIData {
	OpportunityId: PowerBITableField;
	BaseId: PowerBITableField;
	LeadId: PowerBITableField;
	AccountName: PowerBITableField;
	PrimaryContactName: PowerBITableField;
	Topic: PowerBITableField;
	EstimatedRevenue: PowerBITableField;
	EstimatedCloseDate: PowerBITableDateField;
	OpportunityStatus: PowerBITableField;
	OpportunitySalesStage: PowerBITableField;
	QuoteAmount: PowerBITableField;
}

export interface LeadTablePowerBIData {
	LeadId: PowerBITableField;
	BaseId: PowerBITableField;
	AccountId: PowerBITableField;
	AccountName: PowerBITableField;
	ContactName: PowerBITableField;
	Topic: PowerBITableField;
	Status: PowerBITableField;
	Rating: PowerBITableField;
	Source: PowerBITableField;
	CreatedOn: PowerBITableDateField;
}

export type PreFilledValues = Record<string, unknown>;
