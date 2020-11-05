// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import './Forms.scss';
import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { InputBox } from '../InputBox';
import {
	formInputErrorMessage,
	entityNameLeads,
	ratingOptionsSet,
	sourceOptionsSet,
	leadStatus,
} from '../../constants';
import { getFormattedDate, trimInput } from '../utils';
import { saveCDSData, CDSAddRequest } from './SaveData';
import ThemeContext from '../../themeContext';
import { Lead, FormProps, DateFormat, CDSAddRequestData } from '../../models';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';

const createdDate = new Date();

export function AddLeadForm(props: FormProps): JSX.Element {
	const theme = useContext(ThemeContext);
	const { register, handleSubmit, errors } = useForm();
	const onSubmit = async (formData: Lead) => {
		props.toggleWritebackProgressState();
		formData.crcb2_leadstatus = leadStatus['New'];
		formData['createdon'] = createdDate;

		// Build request
		const addRequestData: CDSAddRequestData = {
			newData: JSON.stringify(formData),
			addEntityType: entityNameLeads,
		};
		const addRequest = new CDSAddRequest(addRequestData);
		const result = await saveCDSData(addRequest, props.updateApp, props.setError);
		if (result) {
			props.refreshReport();
			props.toggleFormPopup();
		}
		props.toggleWritebackProgressState();
	};

	const inputBoxesBeforeSelect = [
		{
			title: 'Account Name',
			name: 'parentaccountname',
			required: true,
			className: `form-control form-element ${errors.parentaccountname && `is-invalid`}`,
			placeHolder: `e.g., 'Fabrikam, Inc.'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
		{
			title: 'Contact Full Name',
			name: 'crcb2_primarycontactname',
			required: true,
			className: `form-control form-element ${errors.crcb2_primarycontactname && `is-invalid`}`,
			placeHolder: `e.g., 'John Doe'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
		{
			title: 'Topic',
			name: 'subject',
			required: true,
			className: `form-control form-element ${errors.subject && `is-invalid`}`,
			placeHolder: `e.g.,'100 Laptops'`,
			errorMessage: formInputErrorMessage,
			ref: register({ required: true, minLength: 1 }),
		},
	];

	const inputListBeforeSelect = inputBoxesBeforeSelect.map((input) => {
		return (
			<InputBox
				onBlur={(event) => trimInput(event)}
				title={input.title}
				name={input.name}
				required={input.required}
				className={input.className}
				placeHolder={input.placeHolder}
				errorMessage={input.errorMessage}
				// Grab value from form element
				ref={input.ref}
				key={input.name}
			/>
		);
	});

	const dateBox = (
		<InputBox
			title='Created Date'
			name='createdon'
			value={getFormattedDate(createdDate, DateFormat.DayMonthDayYear)}
			className={`form-control form-element ${errors.createdon && `is-invalid`}`}
			placeHolder='Enter Date'
			errorMessage={formInputErrorMessage}
			// Grab value from form element
			ref={register({ required: true, minLength: 1 })}
			disabled={true}
		/>
	);

	let formActionElement: JSX.Element;
	if (props.isWritebackInProgress) {
		formActionElement = <LoadingSpinner />;
	} else {
		formActionElement = (
			<div className='d-flex justify-content-center btn-form-submit'>
				<button className='btn btn-form' type='submit'>
					Save
				</button>
			</div>
		);
	}

	return (
		<div className={`d-flex flex-column align-items-center overlay ${theme}`}>
			<div className={`popup ${theme}`}>
				<div className={`d-flex justify-content-between popup-header ${theme}`}>
					<label className='popup-form-title'>Add New Lead</label>
					<button
						type='button'
						className={`close close-button single-form-close-button p-0 ${theme}`}
						aria-label='Close'
						onClick={props.toggleFormPopup}>
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
							<label className='input-label required'>Rating</label>
							<select
								className={`form-control form-element ${
									errors.leadqualitycode && `is-invalid`
								} ${theme}`}
								name='leadqualitycode'
								defaultValue=''
								// Grab value from form element
								ref={register({ required: true })}>
								<option className={`select-list ${theme}`} value='' disabled={true}>
									Select
								</option>
								{Object.keys(ratingOptionsSet).map((option) => {
									return (
										<option
											className={`select-list ${theme}`}
											value={ratingOptionsSet[option]}
											key={ratingOptionsSet[option]}>
											{option}
										</option>
									);
								})}
							</select>
							<div className='invalid-feedback'>{formInputErrorMessage}</div>
						</div>

						<div>
							<label className='input-label required'>Source</label>
							<select
								className={`form-control form-element ${
									errors.leadsourcecode && `is-invalid`
								} ${theme}`}
								name='leadsourcecode'
								defaultValue=''
								// Grab value from form element
								ref={register({ required: true })}>
								<option className={`select-list ${theme}`} value='' disabled={true}>
									Select
								</option>
								{Object.keys(sourceOptionsSet).map((option) => {
									return (
										<option
											className={`select-list ${theme}`}
											value={sourceOptionsSet[option]}
											key={sourceOptionsSet[option]}>
											{option}
										</option>
									);
								})}
							</select>
							<div className='invalid-feedback'>{formInputErrorMessage}</div>
						</div>

						{dateBox}
					</div>

					{formActionElement}
				</form>
			</div>
		</div>
	);
}
