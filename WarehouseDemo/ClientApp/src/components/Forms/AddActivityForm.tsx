// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './Forms.scss';
import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { InputBox } from '../InputBox';
import { formInputErrorMessage } from '../../constants';
import { getFormattedDate, trimInput } from '../utils';
import ThemeContext from '../../themeContext';
import { AddActivityFormData } from '../../models';

const activityTypeOptions = ['Appointment', 'Email', 'Letter', 'Phone Call', 'Task'];

const activityPriorityOptions = ['Low', 'Normal', 'High'];

interface AddActivityFormProps {
	toggleActivityFormPopup: { (): void };
}

export function AddActivityForm(props: AddActivityFormProps): JSX.Element {
	const theme = useContext(ThemeContext);
	const { register, handleSubmit, errors } = useForm();
	const [dueDate, setDueDate] = useState({
		dueDate: new Date(),
	});
	const onSubmit = (formData: AddActivityFormData) => {
		// TODO: Use formData to add record in CDS activity entity
		props.toggleActivityFormPopup();
	};

	const inputBoxesBeforeSelect = [
		{
			title: 'Topic',
			name: 'topic',
			className: `form-control form-element ${errors.topic && `is-invalid`}`,
			placeHolder: `Enter Topic, e.g.,'100 Laptops'`,
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
			title: 'Contact Full Name',
			name: 'contactFullName',
			className: `form-control form-element ${errors.contactFullName && `is-invalid`}`,
			placeHolder: `Enter Contact Full Name, e.g., 'John Peltier'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
		{
			title: 'Subject',
			name: 'subject',
			className: `form-control form-element ${errors.subject && `is-invalid`}`,
			placeHolder: `Enter Subject, e.g., '100 Laptops'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
	];

	const inputListBeforeSelect = inputBoxesBeforeSelect.map((input, idx) => {
		return (
			<InputBox
				onBlur={(event) => trimInput(event)}
				title={input.title}
				name={input.name}
				className={input.className}
				placeHolder={input.placeHolder}
				errorMessage={input.errorMessage}
				// grab value from form element
				ref={input.ref}
				key={idx}
			/>
		);
	});

	const descriptionBox = (
		<InputBox
			onBlur={(event) => trimInput(event)}
			title='Description'
			name='description'
			className={`form-control form-element ${errors.description && `is-invalid`}`}
			placeHolder='Enter Description'
			errorMessage={formInputErrorMessage}
			// grab value from form element
			ref={register({ required: true, minLength: 1 })}
		/>
	);

	return (
		<div className={`d-flex flex-column align-items-center overlay ${theme}`}>
			<div className={`popup ${theme}`}>
				<div className={`d-flex justify-content-between popup-header ${theme}`}>
					<label className='popup-form-title'>Add New Activity</label>
					<button
						type='button'
						className={`close close-button single-form-close-button p-0 ${theme}`}
						aria-label='Close'
						onClick={props.toggleActivityFormPopup}>
						<span aria-hidden='true'>&times;</span>
					</button>
				</div>
				<form
					noValidate
					onSubmit={handleSubmit(onSubmit)}
					className={`d-flex flex-column justify-content-between popup-form ${theme}`}>
					<div className='form-content'>
						{inputListBeforeSelect}

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

						<div>
							<label className='input-label'>Priority</label>
							<select
								className={`form-control form-element ${errors.priority && `is-invalid`}`}
								name='priority'
								// grab value from form element
								ref={register({ required: true })}>
								{activityPriorityOptions.map((option, idx) => {
									return (
										<option className={`select-list ${theme}`} value={option} key={idx}>
											{option}
										</option>
									);
								})}
							</select>
						</div>

						<div>
							<label className='input-label'>Activity Type</label>
							<select
								className={`form-control form-element ${errors.activityType && `is-invalid`}`}
								name='activityType'
								// grab value from form element
								ref={register({ required: true })}>
								{activityTypeOptions.map((option, idx) => {
									return (
										<option className={`select-list ${theme}`} value={option} key={idx}>
											{option}
										</option>
									);
								})}
							</select>
						</div>

						{descriptionBox}
					</div>

					<div className='d-flex justify-content-center button-container'>
						<button className='btn btn-form' type='submit'>
							Add Activity
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
