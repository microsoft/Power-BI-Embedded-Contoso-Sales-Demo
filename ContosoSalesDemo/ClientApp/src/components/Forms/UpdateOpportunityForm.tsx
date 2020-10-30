// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import './Forms.scss';
import 'react-datepicker/dist/react-datepicker.css';
import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { NavTabs } from '../NavTabs/NavTabs';
import { InputBox } from '../InputBox';
import {
	opportunityPopupTabNames,
	entityNameActivities,
	entityNameOpportunities,
	formInputErrorMessage,
	activityTypeOptions,
	opportunityStatus,
	opportunitySalesStage,
	activityPriorityOptions,
} from '../../constants';
import { Icon } from '../Icon/Icon';
import {
	setPreFilledValues,
	createTimeOptions,
	trimInput,
	removeWrappingBraces,
	getFormattedDate,
	getCalculatedTime,
} from '../utils';
import { saveCDSData, CDSUpdateAddRequest, CDSUpdateRequest } from './SaveData';
import ThemeContext from '../../themeContext';
import {
	UpdateOpportunityFormData,
	Opportunity,
	Activity,
	Tab,
	FormProps,
	DateFormat,
	CDSAddRequestData,
	CDSUpdateRequestData,
	CDSUpdateAddRequestData,
	OpportunityTablePowerBIData,
	PreFilledValues,
} from '../../models';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';

interface UpdateOpportunityFormProps extends FormProps {
	preFilledValues?: PreFilledValues;
}

export function UpdateOpportunityForm(props: UpdateOpportunityFormProps): JSX.Element {
	const theme = useContext(ThemeContext);
	const [startDate, setStartDate] = useState({
		startDate: new Date(),
	});
	const [endDate, setEndDate] = useState({
		endDate: new Date(),
	});

	// List of tabs' name
	const tabNames: Array<Tab['name']> = opportunityPopupTabNames;

	// State hook to set first tab as active
	const [activeTab, setActiveTab] = useState<Tab['name']>(() => {
		if (tabNames?.length > 0) {
			return tabNames[0];
		} else {
			return null;
		}
	});

	// Create array of Tab for rendering and set isActive as true for the active tab
	const tabsDetails: Array<Tab> = tabNames.map(
		(tabName: Tab['name']): Tab => {
			return { name: tabName, isActive: tabName === activeTab };
		}
	);

	// Opportunity table visual fields in embedded report
	const opportunityTableFields: OpportunityTablePowerBIData = {
		OpportunityId: { name: 'Opportunity Id', value: null },
		BaseId: { name: 'crcb2_baseid', value: null },
		LeadId: { name: 'Lead Id', value: null },
		AccountName: { name: 'Account Name', value: null },
		PrimaryContactName: { name: 'Primary Contact Name', value: null },
		Topic: { name: 'Topic', value: null },
		EstimatedRevenue: { name: 'Estimated Revenue', value: null },
		EstimatedCloseDate: { name: 'Estimated close date', value: null },
		OpportunityStatus: { name: 'Opportunity Status', value: null },
		OpportunitySalesStage: { name: 'Opportunity Sales Stage', value: null },
		QuoteAmount: { name: 'Quote Amount', value: null },
	};

	// Set values from report's table visual
	setPreFilledValues(props.preFilledValues, opportunityTableFields);

	// Set status radio selection
	const [radioSelection, setRadioSelection] = useState<string>(
		// Set the default radio selection to the opportunity status retrieved from report
		opportunityStatus[
			opportunityStatus.findIndex(
				(option) => option.value === opportunityTableFields.OpportunityStatus.value
			)
		].id
	);

	function setOpportunityValues(): Opportunity {
		const saleStage = opportunitySalesStage[opportunityTableFields.OpportunitySalesStage.value];
		const statusIndex = opportunityStatus.findIndex(
			(option) => option.value === opportunityTableFields.OpportunityStatus.value
		);
		const opportunity: Opportunity = {
			name: opportunityTableFields.Topic.value,
			estimatedvalue: parseInt(opportunityTableFields.EstimatedRevenue.value),
			estimatedclosedate: getFormattedDate(
				opportunityTableFields.EstimatedCloseDate.value,
				DateFormat.YearMonthDay
			),
			crcb2_opportunitystatus: opportunityStatus[statusIndex].code,
			crcb2_salesstage: saleStage,
			crcb2_quoteamount: parseInt(
				opportunityTableFields.QuoteAmount.value ?? opportunityTableFields.EstimatedRevenue.value
			),
		};
		// Remove '{' and '}' from the id captured from report table visual
		opportunity['originatingleadid@odata.bind'] = `leads(${removeWrappingBraces(
			opportunityTableFields.LeadId.value
		)})`;
		return opportunity;
	}

	const { register, handleSubmit, errors } = useForm();
	const editTopicFormOnSubmit = async (formData: Opportunity) => {
		props.toggleWritebackProgressState();
		const opportunityData: Opportunity = setOpportunityValues();
		opportunityData.name = formData.name;

		// Build request
		const updateRequestData: CDSUpdateRequestData = {
			baseId: opportunityTableFields.BaseId.value ?? opportunityTableFields.OpportunityId.value,
			updatedData: JSON.stringify(opportunityData),
			updateEntityType: entityNameOpportunities,
		};
		const updateRequest = new CDSUpdateRequest(updateRequestData);
		const result = await saveCDSData(updateRequest, props.updateApp, props.setError);
		if (result) {
			props.refreshReport();
			props.toggleFormPopup();
		}
		props.toggleWritebackProgressState();
	};
	const meetingFormOnSubmit = async (formData: UpdateOpportunityFormData) => {
		props.toggleWritebackProgressState();

		const opportunityData: Opportunity = setOpportunityValues();
		opportunityData.crcb2_opportunitystatus =
			opportunityStatus[
				opportunityStatus.findIndex((option) => option.value === 'Meeting Scheduled')
			].code;
		// Set time for the meeting as selected by the user
		const meetingStartTime = getCalculatedTime(formData['starttime']);
		startDate.startDate.setHours(meetingStartTime[0]);
		startDate.startDate.setMinutes(meetingStartTime[1]);

		const meetingEndTime = getCalculatedTime(formData['endtime']);
		endDate.endDate.setHours(meetingEndTime[0]);
		endDate.endDate.setMinutes(meetingEndTime[1]);

		const formattedStartDate = getFormattedDate(startDate.startDate, DateFormat.YearMonthDayTime);
		const formattedEndDate = getFormattedDate(endDate.endDate, DateFormat.YearMonthDayTime);

		const activityData: Activity = {
			crcb2_description: formData.description,
			crcb2_startdatetime: formattedStartDate,
			crcb2_enddatetime: formattedEndDate,
			crcb2_duedatetime: formattedEndDate,
			crcb2_activitytype: activityTypeOptions['Appointment'],
			crcb2_priority: activityPriorityOptions['High'],
			crcb2_subject: formData.title,
			crcb2_topic: opportunityTableFields.Topic.value,
		};

		// Remove '{' and '}' from the id captured from report table visual
		activityData['crcb2_LeadId@odata.bind'] = `leads(${removeWrappingBraces(
			opportunityTableFields.LeadId.value
		)})`;

		// Build request
		const updateRequestData: CDSUpdateRequestData = {
			baseId: opportunityTableFields.BaseId.value ?? opportunityTableFields.OpportunityId.value,
			updatedData: JSON.stringify(opportunityData),
			updateEntityType: entityNameOpportunities,
		};
		const addRequestData: CDSAddRequestData = {
			newData: JSON.stringify(activityData),
			addEntityType: entityNameActivities,
		};
		const updateAddRequestData: CDSUpdateAddRequestData = {
			UpdateReqBody: updateRequestData,
			AddReqBody: addRequestData,
		};
		const requestObject = new CDSUpdateAddRequest(updateAddRequestData);
		const result = await saveCDSData(requestObject, props.updateApp, props.setError);
		if (result) {
			props.refreshReport();
			props.toggleFormPopup();
		}

		props.toggleWritebackProgressState();
	};
	const quoteFormOnSubmit = async (formData: UpdateOpportunityFormData) => {
		props.toggleWritebackProgressState();

		const opportunityData: Opportunity = setOpportunityValues();
		opportunityData.crcb2_quoteamount = formData.editquote;

		// Build request
		const updateRequestData: CDSUpdateRequestData = {
			baseId: opportunityTableFields.BaseId.value ?? opportunityTableFields.OpportunityId.value,
			updatedData: JSON.stringify(opportunityData),
			updateEntityType: entityNameOpportunities,
		};
		const updateRequest = new CDSUpdateRequest(updateRequestData);
		const result = await saveCDSData(updateRequest, props.updateApp, props.setError);
		if (result) {
			props.refreshReport();
			props.toggleFormPopup();
		}
		props.toggleWritebackProgressState();
	};
	const statusFormOnSubmit = async () => {
		props.toggleWritebackProgressState();
		const opportunityData: Opportunity = setOpportunityValues();
		opportunityData.crcb2_opportunitystatus =
			opportunityStatus[opportunityStatus.findIndex((option) => option.id === radioSelection)].code;
		if (radioSelection === 'closedWon') {
			opportunityData['actualvalue'] =
				opportunityTableFields.QuoteAmount.value ?? opportunityTableFields.EstimatedRevenue.value;
		}

		// Build request
		const updateRequestData: CDSUpdateRequestData = {
			baseId: opportunityTableFields.BaseId.value ?? opportunityTableFields.OpportunityId.value,
			updatedData: JSON.stringify(opportunityData),
			updateEntityType: entityNameOpportunities,
		};
		const updateRequest = new CDSUpdateRequest(updateRequestData);
		const result = await saveCDSData(updateRequest, props.updateApp, props.setError);
		if (result) {
			props.refreshReport();
			props.toggleFormPopup();
		}
		props.toggleWritebackProgressState();
	};

	const navTabs = <NavTabs tabsList={tabsDetails} tabOnClick={setActiveTab} />;

	const editTopicInputBox = (
		<InputBox
			onBlur={(event) => trimInput(event)}
			title='Topic'
			name='name'
			className={`form-control form-element ${errors.name && `is-invalid`}`}
			placeHolder={`Enter Topic, e.g.,'100 Laptops'`}
			errorMessage={formInputErrorMessage}
			value={opportunityTableFields.Topic.value}
			ref={register({ required: true, minLength: 1 })}
		/>
	);

	let formActionElement: JSX.Element = <LoadingSpinner />;
	if (!props.isWritebackInProgress) {
		formActionElement = (
			<div className='d-flex justify-content-center btn-form-submit'>
				<button className='btn btn-form' type='submit'>
					Save
				</button>
			</div>
		);
	}
	const editTopicForm = (
		<form
			className={`d-flex flex-column justify-content-between popup-form ${theme}`}
			noValidate
			onSubmit={handleSubmit(editTopicFormOnSubmit)}>
			<div className='form-content'>{editTopicInputBox}</div>
			{formActionElement}
		</form>
	);

	const meetingFormInputBoxesBeforeDate = [
		{
			title: 'Title',
			name: 'title',
			className: 'form-control form-element',
			// Show '--blank--' where applicable if empty field is fetched from the report
			placeHolder: '--blank--',
			value: opportunityTableFields.Topic.value,
			ref: register,
		},
		{
			title: 'Account Name',
			name: 'meetingAccountName',
			className: 'form-control form-element',
			placeHolder: '--blank--',
			value: opportunityTableFields.AccountName.value,
			ref: register,
		},
		{
			title: 'Full Name',
			name: 'fullName',
			className: 'form-control form-element',
			placeHolder: '--blank--',
			value: opportunityTableFields.PrimaryContactName.value,
			ref: register,
		},
	];

	const meetingFormInputListBeforeDate = meetingFormInputBoxesBeforeDate.map((input) => {
		return (
			<InputBox
				onBlur={(event) => trimInput(event)}
				title={input.title}
				name={input.name}
				className={input.className}
				placeHolder={input.placeHolder}
				value={input.value}
				disabled={true}
				ref={input.ref}
				key={input.name}
			/>
		);
	});

	const meetingFormDescriptionBox = (
		<InputBox
			onBlur={(event) => trimInput(event)}
			title='Description'
			name='description'
			className={`form-control form-element ${errors.description && `is-invalid`}`}
			placeHolder='Enter Description'
			errorMessage={formInputErrorMessage}
			ref={register({ required: true, minLength: 1 })}
		/>
	);

	const timeOptions = createTimeOptions();

	if (!props.isWritebackInProgress) {
		formActionElement = (
			<div className='d-flex justify-content-center btn-form-submit'>
				<button className='btn btn-form' type='submit'>
					Save
				</button>
			</div>
		);
	}
	const meetingForm = (
		<form
			className={`d-flex flex-column justify-content-between popup-form ${theme}`}
			noValidate
			onSubmit={handleSubmit(meetingFormOnSubmit)}>
			<div className='form-content'>
				{meetingFormInputListBeforeDate}
				<div>
					<label className='input-label'>Date and Time</label>
					<div className='d-flex flex-row justify-content-between align-items-center date-time-container'>
						<DatePicker
							className={`form-control form-element date ${theme}`}
							name='startdate'
							selected={startDate.startDate}
							onChange={(date: Date) => {
								setStartDate({ startDate: date });
							}}
							dateFormat='MMM dd, yyyy'
							ref={register({ required: true })}
						/>
						<select
							className={`form-control form-element time ${theme}`}
							name='starttime'
							ref={register({ required: true })}>
							{timeOptions.map((timeOption, idx) => {
								return (
									<option className={`select-list ${theme}`} value={timeOption} key={idx}>
										{timeOption}
									</option>
								);
							})}
						</select>
						<Icon
							className='right-arrow'
							iconId={`icon-feather-arrow-right-${theme}`}
							width={16.5}
							height={17}
						/>
						<DatePicker
							className={`form-control form-element date ${theme}`}
							name='enddate'
							selected={endDate.endDate}
							onChange={(date: Date) => setEndDate({ endDate: date })}
							dateFormat='MMM dd, yyyy'
							ref={register({ required: true })}
						/>
						<select
							className={`form-control form-element time ${theme}`}
							name='endtime'
							ref={register({ required: true })}>
							{timeOptions.map((timeOption, idx) => {
								return (
									<option className={`select-list ${theme}`} value={timeOption} key={idx}>
										{timeOption}
									</option>
								);
							})}
						</select>
					</div>
				</div>
				{meetingFormDescriptionBox}
			</div>
			{formActionElement}
		</form>
	);

	const quoteFormInputBoxes = [
		{
			title: 'Account Name',
			name: 'quoteaccountname',
			className: 'form-control form-element',
			placeHolder: '--blank--',
			value: opportunityTableFields.AccountName.value,
			disabled: true,
			ref: register,
		},
		{
			title: 'Contact Full Name',
			name: 'contactfullname',
			className: 'form-control form-element',
			placeHolder: '--blank--',
			value: opportunityTableFields.PrimaryContactName.value,
			disabled: true,
			ref: register,
		},
		{
			title: 'Topic',
			name: 'quotetopic',
			className: 'form-control form-element',
			placeHolder: '--blank--',
			value: opportunityTableFields.Topic.value,
			disabled: true,
			ref: register,
		},
		{
			title: 'Estimated Revenue',
			name: 'estimatedrevenue',
			className: 'form-control form-element',
			placeHolder: '--blank--',
			value: opportunityTableFields.EstimatedRevenue.value,
			disabled: true,
			ref: register,
		},
		{
			title: 'Current Quote',
			name: 'currentquote',
			className: 'form-control form-element',
			placeHolder: '--blank--',
			value: opportunityTableFields.QuoteAmount.value ?? opportunityTableFields.EstimatedRevenue.value,
			disabled: true,
			ref: register,
		},
		{
			title: 'Edit Quote',
			name: 'editquote',
			className: `form-control form-element ${errors.editquote && `is-invalid`}`,
			placeHolder: `Enter quote amount (in $) e.g. '30000'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
	];

	const quoteFormInputList = quoteFormInputBoxes.map((input) => {
		return (
			<InputBox
				onBlur={(event) => trimInput(event)}
				title={input.title}
				name={input.name}
				className={input.className}
				placeHolder={input.placeHolder}
				errorMessage={input.errorMessage}
				value={input.value}
				disabled={input.disabled}
				ref={input.ref}
				key={input.name}
			/>
		);
	});

	if (!props.isWritebackInProgress) {
		formActionElement = (
			<div className='d-flex justify-content-center btn-form-submit'>
				<button className='btn btn-form' type='submit'>
					Update
				</button>
			</div>
		);
	}
	const quoteForm = (
		<form
			className={`d-flex flex-column justify-content-between popup-form ${theme}`}
			noValidate
			onSubmit={handleSubmit(quoteFormOnSubmit)}>
			<div className='form-content'>{quoteFormInputList}</div>
			{formActionElement}
		</form>
	);

	const statusFormOptions = opportunityStatus.map((option) => {
		return (
			<div className='opportunity-status-radio' key={option.id}>
				<input
					className='form-check-input status-radio'
					type='radio'
					name='opportunitystatus'
					id={option.id}
					value={option.value}
					onChange={() => setRadioSelection(option.id)}
					checked={option.id === radioSelection}
				/>
				<label
					className={`form-check-label r-label label-radio opportunity-status-text ${theme}`}
					htmlFor={option.id}>
					{option.value}
				</label>
			</div>
		);
	});

	if (!props.isWritebackInProgress) {
		formActionElement = (
			<div className='d-flex justify-content-center btn-form-submit'>
				<button className='btn btn-form' type='submit'>
					Save
				</button>
			</div>
		);
	}
	const statusForm = (
		<form
			className={`d-flex flex-column justify-content-between popup-form ${theme}`}
			noValidate
			onSubmit={handleSubmit(statusFormOnSubmit)}>
			<div className='form-content'>
				<label className='input-label'>Select Opportunity Status</label>
				{statusFormOptions}
			</div>
			{formActionElement}
		</form>
	);

	return (
		<div className={`d-flex flex-column align-items-center overlay ${theme}`}>
			<div className={`popup ${theme}`}>
				<div className={`d-flex justify-content-between popup-header ${theme}`}>
					<div className='tab-container'>{navTabs}</div>
					<button
						type='button'
						className={`close close-button tabbed-form-close-button p-0 ${theme}`}
						aria-label='Close'
						onClick={props.toggleFormPopup}>
						<span aria-hidden='true'>&times;</span>
					</button>
				</div>
				{activeTab === tabNames[0]
					? editTopicForm
					: activeTab === tabNames[1]
					? meetingForm
					: activeTab === tabNames[2]
					? quoteForm
					: activeTab === tabNames[3]
					? statusForm
					: null}
			</div>
		</div>
	);
}
