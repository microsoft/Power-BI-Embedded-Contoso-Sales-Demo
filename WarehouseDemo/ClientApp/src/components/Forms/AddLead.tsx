// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './Forms.scss';
import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { InputBox } from '../InputBox';
import { formInputErrorMessage } from '../../constants';
import { getFormattedDate } from '../utils';
import ThemeContext from '../../themeContext';

const ratingOptionsSet = ['Hot', 'Warm', 'Cold'];

const sourceOptionsSet = [
	'Advertisement',
	'Employee Referral',
	'External Referral',
	'Partner',
	'Public Relations',
	'Seminar',
	'Trade Show',
	'Web',
	'Word of Mouth',
	'Other',
];

const createdDate = new Date();

interface AddLeadFormData {
	accountName: string;
	contactFullName: string;
	topic: string;
	rating: string;
	source: string;
	createdOn: string;
}

interface AddLeadFormProps {
	toggleAddLeadFormPopup: { (): void };
}

export function AddLeadForm(props: AddLeadFormProps): JSX.Element {
	const theme = useContext(ThemeContext);
	const { register, handleSubmit, errors } = useForm();
	const onSubmit = (formData: AddLeadFormData) => {
		// TODO: Use formData to add record in CDS activity entity
		props.toggleAddLeadFormPopup();
	};

	const inputBoxesBeforeSelect = [
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
			placeHolder: `Enter Full Name, e.g., 'John Doe'`,
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
	];

	const inputListBeforeSelect = inputBoxesBeforeSelect.map((input) => {
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

	const dateBox = (
		<InputBox
			title='Created Date'
			name='createdDate'
			value={getFormattedDate(createdDate)}
			className={`form-control form-element ${errors.createdDate && `is-invalid`}`}
			placeHolder='Enter Date'
			errorMessage={formInputErrorMessage}
			// grab value from form element
			ref={register({ required: true, minLength: 1 })}
			disabled={true}
		/>
	);

	return (
		<div className={`d-flex flex-column justify-content-center align-items-center overlay ${theme}`}>
			<div className={`popup ${theme}`}>
				<div className={`d-flex justify-content-between popup-header ${theme}`}>
					<label className='popup-form-title'>Add New Lead</label>
					<button
						type='button'
						className={`close close-button single-form-close-button p-0 ${theme}`}
						aria-label='Close'
						onClick={props.toggleAddLeadFormPopup}>
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
							<label className='input-label'>Rating</label>
							<select
								className={`form-control form-element ${errors.rating && `is-invalid`}`}
								name='rating'
								// grab value from form element
								ref={register({ required: true })}>
								{ratingOptionsSet.map((option, idx) => {
									return (
										<option value={option} key={idx}>
											{option}
										</option>
									);
								})}
							</select>
						</div>

						<div>
							<label className='input-label'>Source</label>
							<select
								className={`form-control form-element ${errors.source && `is-invalid`}`}
								name='source'
								// grab value from form element
								ref={register({ required: true })}>
								{sourceOptionsSet.map((option, idx) => {
									return (
										<option value={option} key={idx}>
											{option}
										</option>
									);
								})}
							</select>
						</div>

						{dateBox}
					</div>

					<div className='d-flex justify-content-center button-container'>
						<button className='btn btn-form' type='submit'>
							Save
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
