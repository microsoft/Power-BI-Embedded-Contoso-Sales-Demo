// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './Forms.scss';
import 'react-datepicker/dist/react-datepicker.css';
import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { opportunityPopupTabNames } from '../tabConfig';
import { NavTabs, Tab } from '../NavTabs/NavTabs';
import { InputBox } from '../InputBox';
import { formInputErrorMessage } from '../../constants';
import { createTimeOptions } from '../utils';
import ThemeContext from '../../themeContext';

// List of radio button for status form
const statusFormOptionsSet = [
	{
		id: 'new',
		value: 'New',
		checked: true,
	},
	{
		id: 'meetingScheduled',
		value: 'Meeting Scheduled',
		checked: false,
	},
	{
		id: 'quoteSent',
		value: 'Quote Sent',
		checked: false,
	},
	{
		id: 'closedWon',
		value: 'Closed Won',
		checked: false,
	},
	{
		id: 'closedLost',
		value: 'Closed Lost',
		checked: false,
	},
];

interface UpdateOpportunityFormData {
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

interface UpdateOpportunityFormProps {
	toggleUpdateOpportunityFormPopup: { (): void };
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

	// Set status radio selection
	const [radioSelection, setRadioSelection] = useState<string>(
		statusFormOptionsSet[0].id // Set the default radio selection to first option
	);

	// Create array of Tab for rendering and set isActive as true for the active tab
	const tabsDetails: Array<Tab> = tabNames.map(
		(tabName: Tab['name']): Tab => {
			return { name: tabName, isActive: tabName === activeTab };
		}
	);

	const { register, handleSubmit, errors } = useForm();
	const onSubmit = (formData: UpdateOpportunityFormData) => {
		// TODO: Use form data to use the data with CDS rest APIs
		props.toggleUpdateOpportunityFormPopup();
	};

	const navTabs = <NavTabs tabsList={tabsDetails} tabOnClick={setActiveTab} />;

	const editTopicInputBox = (
		<InputBox
			title='Topic'
			name='topic'
			className={`form-control form-element ${errors.topic && `is-invalid`}`}
			placeHolder={`Enter Topic, e.g.,'100 Laptops'`}
			errorMessage={formInputErrorMessage}
			ref={register({ required: true, minLength: 1 })}
		/>
	);

	const editTopicForm = (
		<form
			className={`d-flex flex-column justify-content-between popup-form ${theme}`}
			noValidate
			onSubmit={handleSubmit(onSubmit)}>
			<div className='form-content'>{editTopicInputBox}</div>
			<div className='d-flex justify-content-center button-container'>
				<button className='btn btn-form' type='submit'>
					Save
				</button>
			</div>
		</form>
	);

	const meetingFormInputBoxesBeforeDate = [
		{
			title: 'Title',
			name: 'title',
			className: `form-control form-element ${errors.title && `is-invalid`}`,
			placeHolder: `Enter Topic, e.g.,'Office 365 License Requirement Discussion'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
		{
			title: 'Account Name',
			name: 'accountName',
			className: `form-control form-element ${errors.accountName && `is-invalid`}`,
			placeHolder: `Enter Account Name, e.g., 'Fabrikam, Inc.'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
		{
			title: 'Full Name',
			name: 'fullName',
			className: `form-control form-element ${errors.fullName && `is-invalid`}`,
			placeHolder: `Enter Contact Full Name, e.g., 'Isabella Rasmussen'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
	];

	const meetingFormInputListBeforeDate = meetingFormInputBoxesBeforeDate.map((input, idx) => {
		return (
			<InputBox
				title={input.title}
				name={input.name}
				className={input.className}
				placeHolder={input.placeHolder}
				errorMessage={input.errorMessage}
				ref={input.ref}
				key={idx}
			/>
		);
	});

	const meetingFormDescriptionBox = (
		<InputBox
			title='Description'
			name='description'
			className={`form-control form-element ${errors.description && `is-invalid`}`}
			placeHolder='Enter Description'
			errorMessage={formInputErrorMessage}
			ref={register({ required: true, minLength: 1 })}
		/>
	);

	const timeOptions = createTimeOptions();

	const meetingForm = (
		<form
			className={`d-flex flex-column justify-content-between popup-form ${theme}`}
			noValidate
			onSubmit={handleSubmit(onSubmit)}>
			<div className='form-content'>
				{meetingFormInputListBeforeDate}
				<div>
					<label className='input-label'>Date and Time</label>
					<div className='d-flex flex-row justify-content-between date-time-container'>
						<DatePicker
							className='form-control form-element date'
							name='startDate'
							selected={startDate.startDate}
							onChange={(date: Date) => {
								setStartDate({ startDate: date });
							}}
							dateFormat='MMM dd, yyyy'
							ref={register({ required: true })}
						/>
						<select
							className='form-control form-element time'
							name='startTime'
							ref={register({ required: true })}>
							{timeOptions.map((timeOption, idx) => {
								return (
									<option value={timeOption} key={idx}>
										{timeOption}
									</option>
								);
							})}
						</select>
						<img
							className='right-arrow'
							src={require(`../../assets/Icons/Icon feather-arrow-right-${theme}.svg`)}
							alt={`right-arrow-${theme}`}
						/>
						<DatePicker
							className='form-control form-element date'
							name='endDate'
							selected={endDate.endDate}
							onChange={(date: Date) => setEndDate({ endDate: date })}
							dateFormat='MMM dd, yyyy'
							ref={register({ required: true })}
						/>
						<select
							className='form-control form-element time'
							name='endTime'
							ref={register({ required: true })}>
							{timeOptions.map((timeOption, idx) => {
								return (
									<option value={timeOption} key={idx}>
										{timeOption}
									</option>
								);
							})}
						</select>
					</div>
				</div>
				{meetingFormDescriptionBox}
			</div>
			<div className='d-flex justify-content-center button-container'>
				<button className='btn btn-form' type='submit'>
					Save
				</button>
			</div>
		</form>
	);

	const quoteFormInputBoxes = [
		{
			title: 'Account Name',
			name: 'accountName',
			className: `form-control form-element ${errors.accountName && `is-invalid`}`,
			placeHolder: `Enter Account Name, e.g., 'Fabrikam, Inc.'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
		{
			title: 'Contact Full Name',
			name: 'contactFullName',
			className: `form-control form-element ${errors.contactFullName && `is-invalid`}`,
			placeHolder: `Enter Contact Full Name, e.g., 'Isabella Rasmussen'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
		{
			title: 'Topic',
			name: 'topic',
			className: `form-control form-element ${errors.topic && `is-invalid`}`,
			placeHolder: `Enter Topic, e.g.,'12 orders of Product SKU JGHK'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
		{
			title: 'Estimated Revenue',
			name: 'estimatedRevenue',
			className: `form-control form-element ${errors.estimatedRevenue && `is-invalid`}`,
			placeHolder: '$30,000',
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
		{
			title: 'Current Quote',
			name: 'currentQuote',
			className: `form-control form-element ${errors.currentQuote && `is-invalid`}`,
			placeHolder: '$30,000.00',
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
		{
			title: 'Edit Quote',
			name: 'editQuote',
			className: `form-control form-element ${errors.editQuote && `is-invalid`}`,
			placeHolder: '$30,000.00',
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
	];

	const quoteFormInputList = quoteFormInputBoxes.map((input, idx) => {
		return (
			<InputBox
				title={input.title}
				name={input.name}
				className={input.className}
				placeHolder={input.placeHolder}
				errorMessage={input.errorMessage}
				ref={input.ref}
				key={idx}
			/>
		);
	});

	const quoteForm = (
		<form
			className={`d-flex flex-column justify-content-between popup-form ${theme}`}
			noValidate
			onSubmit={handleSubmit(onSubmit)}>
			<div className='form-content'>{quoteFormInputList}</div>
			<div className='d-flex justify-content-center button-container'>
				<button className='btn btn-form multiple-submit-buttons' type='submit'>
					Update
				</button>
				<button className='btn btn-form multiple-submit-buttons' type='submit'>
					Update and Send
				</button>
			</div>
		</form>
	);

	const statusFormOptions = statusFormOptionsSet.map((option, idx) => {
		return (
			<div className='custom-control custom-radio' key={idx}>
				<input
					className='custom-control-input'
					type='radio'
					name='opportunityStatus'
					id={option.id}
					value={option.value}
					onChange={() => setRadioSelection(option.id)}
					checked={option.id === radioSelection}
				/>
				<label className={`custom-control-label r-label label-radio ${theme}`} htmlFor={option.id}>
					{option.value}
				</label>
			</div>
		);
	});

	const statusForm = (
		<form
			className={`d-flex flex-column justify-content-between popup-form ${theme}`}
			noValidate
			onSubmit={handleSubmit(onSubmit)}>
			<div className='form-content'>
				<label className='input-label'>Select Opportunity Status</label>
				{statusFormOptions}
			</div>
			<div className='d-flex justify-content-center button-container'>
				<button className='btn btn-form' type='submit'>
					Save
				</button>
			</div>
		</form>
	);

	return (
		<div className={`d-flex flex-column justify-content-center align-items-center overlay ${theme}`}>
			<div className={`popup ${theme}`}>
				<div className={`d-flex justify-content-between popup-header ${theme}`}>
					<div className='tab-container'>{navTabs}</div>
					<button
						type='button'
						className={`close close-button tabbed-form-close-button p-0 ${theme}`}
						aria-label='Close'
						onClick={props.toggleUpdateOpportunityFormPopup}>
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
