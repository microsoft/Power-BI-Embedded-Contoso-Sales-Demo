// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './Forms.scss';
import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { InputBox } from '../InputBox';
import { formInputErrorMessage } from '../../constants';
import ThemeContext from '../../themeContext';

interface AddActivityFormData {
	topic: string;
	accountName: string;
	contactFullName: string;
	subject: string;
	dueDate: string;
	priority: string;
	activityType: string;
	description: string;
}

interface AddActivityFormProps {
	toggleActivityFormPopup: { (): void };
}

export function AddActivityForm(props: AddActivityFormProps): JSX.Element {
	const theme = useContext(ThemeContext);
	const { register, handleSubmit, errors } = useForm();
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
		<div className={`d-flex flex-column justify-content-center align-items-center overlay ${theme}`}>
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
							<select
								className={`form-control form-element ${errors.dueDate && `is-invalid`}`}
								name='dueDate'
								// grab value from form element
								ref={register({ required: true })}>
								<option value='dummy_date'>Select Due Date...</option>
							</select>
						</div>

						<div>
							<label className='input-label'>Priority</label>
							<select
								className={`form-control form-element ${errors.priority && `is-invalid`}`}
								name='priority'
								// grab value from form element
								ref={register({ required: true })}>
								<option value='dummy_priority'>Select Priority...</option>
							</select>
						</div>

						<div>
							<label className='input-label'>Activity Type</label>
							<select
								className={`form-control form-element ${errors.activityType && `is-invalid`}`}
								name='activityType'
								// grab value from form element
								ref={register({ required: true })}>
								<option value='dummy_act'>Select Activity Type...</option>
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
