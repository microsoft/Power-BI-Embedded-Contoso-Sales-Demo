// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './Forms.scss';
import 'react-datepicker/dist/react-datepicker.css';
import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { editLeadPopupTabNames } from '../tabConfig';
import { NavTabs, Tab } from '../NavTabs/NavTabs';
import { InputBox } from '../InputBox';
import { formInputErrorMessage } from '../../constants';
import { getFormattedDate } from '../utils';
import ThemeContext from '../../themeContext';

const activityTypeOptions = ['Appointment', 'Email', 'Letter', 'Phone Call', 'Task'];

const activityPriorityOptions = ['Low', 'Normal', 'High'];

interface EditLeadFormData {
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

interface EditLeadFormProps {
	toggleEditLeadFormPopup: { (): void };
}

export function EditLeadForm(props: EditLeadFormProps): JSX.Element {
	const theme = useContext(ThemeContext);
	const [dueDate, setDueDate] = useState({
		dueDate: new Date(),
	});

	// List of tabs' name
	const tabNames: Array<Tab['name']> = editLeadPopupTabNames;

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

	const { register, handleSubmit, errors } = useForm();
	const onSubmit = (formData: EditLeadFormData) => {
		// TODO: Use form data to use the data with CDS rest APIs
		props.toggleEditLeadFormPopup();
	};

	const navTabs = <NavTabs tabsList={tabsDetails} tabOnClick={setActiveTab} />;

	const addActivityInputBoxesBeforeSelect = [
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
			placeHolder: `Enter Contact Full Name, e.g., 'John Peltier'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
		{
			title: 'Topic',
			name: 'topic',
			className: `form-control form-element ${errors.topic && `is-invalid`}`,
			placeHolder: `Enter Topic, e.g.,'Like our products'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
	];

	const addActivityInputListBeforeSelect = addActivityInputBoxesBeforeSelect.map((input) => {
		return (
			<InputBox
				title={input.title}
				name={input.name}
				className={input.className}
				placeHolder={input.placeHolder}
				errorMessage={input.errorMessage}
				// grab value from form element
				ref={input.ref}
				key={input.name}
			/>
		);
	});

	const subjectBox = (
		<InputBox
			title='Subject'
			name='subject'
			className={`form-control form-element ${errors.subject && `is-invalid`}`}
			placeHolder={`Enter Subject, e.g., '100 Laptops'`}
			errorMessage={formInputErrorMessage}
			// grab value from form element
			ref={register({ required: true, minLength: 1 })}
		/>
	);

	const descriptionBox = (
		<InputBox
			title='Description'
			name='description'
			className={`form-control form-element ${errors.description && `is-invalid`}`}
			placeHolder='Enter Description'
			errorMessage={formInputErrorMessage}
			// grab value from form element
			ref={register({ required: true, minLength: 1 })}
		/>
	);

	const addActivityForm = (
		<form
			className={`d-flex flex-column justify-content-between popup-form ${theme}`}
			noValidate
			onSubmit={handleSubmit(onSubmit)}>
			<div className='form-content'>
				{addActivityInputListBeforeSelect}

				<div>
					<label className='input-label'>Activity Type</label>
					<select
						className={`form-control form-element ${errors.activityType && `is-invalid`}`}
						name='activityType'
						// grab value from form element
						ref={register({ required: true })}>
						{activityTypeOptions.map((option, idx) => {
							return (
								<option value={option} key={idx}>
									{option}
								</option>
							);
						})}
					</select>
				</div>

				{subjectBox}

				<div>
					<label className='input-label'>Priority</label>
					<select
						className={`form-control form-element ${errors.priority && `is-invalid`}`}
						name='priority'
						// grab value from form element
						ref={register({ required: true })}>
						{activityPriorityOptions.map((option, idx) => {
							return (
								<option value={option} key={idx}>
									{option}
								</option>
							);
						})}
					</select>
				</div>

				{descriptionBox}

				<div>
					<label className='input-label'>Due Date</label>
					<div className='date-container'>
						<DatePicker
							className='form-control form-element date-picker'
							name='dueDate'
							selected={dueDate.dueDate}
							value={getFormattedDate(dueDate.dueDate)}
							onChange={(date: Date) => setDueDate({ dueDate: date })}
							ref={register({ required: true })}
						/>
					</div>
				</div>
			</div>
			<div className='d-flex justify-content-center button-container'>
				<button className='btn btn-form' type='submit'>
					Add Activity
				</button>
			</div>
		</form>
	);

	const qualifyLeadInputBoxes = [
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
			placeHolder: `Enter Topic, e.g.,'100 Laptops'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
		{
			title: 'Estimated Revenue',
			name: 'estimatedRevenue',
			className: `form-control form-element ${errors.estimatedRevenue && `is-invalid`}`,
			placeHolder: 'Enter Estimated Revenue, e.g., $10,000',
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
		{
			title: 'Estimated Close Date',
			name: 'estimatedCloseDate',
			className: `form-control form-element ${errors.estimatedCloseDate && `is-invalid`}`,
			placeHolder: 'Enter Estimated Close Date, e.g., Monday, May 4, 2020',
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
	];

	const qualifyLeadInputList = qualifyLeadInputBoxes.map((input) => {
		return (
			<InputBox
				title={input.title}
				name={input.name}
				className={input.className}
				placeHolder={input.placeHolder}
				errorMessage={input.errorMessage}
				ref={input.ref}
				key={input.name}
			/>
		);
	});

	const qualifyLeadForm = (
		<form
			className={`d-flex flex-column justify-content-between popup-form ${theme}`}
			noValidate
			onSubmit={handleSubmit(onSubmit)}>
			<div className='form-content'>{qualifyLeadInputList}</div>
			<div className='d-flex justify-content-center button-container'>
				<button className='btn btn-form' type='submit'>
					Qualify Lead
				</button>
			</div>
		</form>
	);

	const disqualifyLeadForm = (
		<form
			className={`d-flex flex-column justify-content-between popup-form ${theme}`}
			noValidate
			onSubmit={handleSubmit(onSubmit)}>
			<div className='form-content'>
				<div className={`d-flex flex-row warning ${theme}`}>
					<img
						src={require(`../../assets/Icons/error-${theme}.svg`)}
						className='warning-icon'
						alt='warning'></img>
					<div>Are you sure you want to disqualify this lead?</div>
				</div>
			</div>
			<div className='d-flex justify-content-center button-container'>
				<button className='btn btn-form' type='submit'>
					Disqualify Lead
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
						onClick={props.toggleEditLeadFormPopup}>
						<span aria-hidden='true'>&times;</span>
					</button>
				</div>
				{activeTab === tabNames[0]
					? addActivityForm
					: activeTab === tabNames[1]
					? qualifyLeadForm
					: activeTab === tabNames[2]
					? disqualifyLeadForm
					: null}
			</div>
		</div>
	);
}
