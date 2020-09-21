// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import './Error.scss';
import React, { useContext } from 'react';
import ThemeContext from '../../themeContext';
import { Icon } from '../Icon/Icon';
import { captializeFirstLetterOfWords } from '../utils';

export interface ErrorProps {
	error: string;
	setError: { (error: string): void };
}

/**
 * Component to render error details in a popup
 * @params {ErrorProps} error string and toggleErrorState function
 */
export function Error(props: ErrorProps): JSX.Element {
	const theme = useContext(ThemeContext);
	const errorIconDimension = 30;
	const errorDetails: Array<string> = [];

	let jsonError: Record<string, unknown>;
	let isValidJson = true;

	try {
		jsonError = JSON.parse(props.error);

		// Capture all JSON keys into an array
		for (const key in jsonError) {
			errorDetails.push(key);
		}
	} catch (error) {
		isValidJson = false;
	}

	// Retrieve the error message based on error structure. If directly available or to be read from JSON else blank.
	const error: string = errorDetails.includes('message')
		? jsonError['message'].toString()
		: !isValidJson
		? props.error
		: '';

	return (
		<div
			id='modal-error'
			className={`modal ${props.error !== '' ? 'd-block' : 'd-none'}`}
			role='dialog'
			aria-hidden='true'>
			<div className='modal-dialog modal-dialog-centered modal-dialog-error' role='document'>
				<div className={`modal-content height-auto shadow-lg ${theme}`}>
					<div className='modal-header modal-header-error'>
						<Icon
							iconId={`error-${theme}`}
							height={errorIconDimension}
							width={errorIconDimension}
						/>
						<p className={`modal-title ${theme}`}>ERROR</p>
					</div>
					<div className='modal-body modal-body-error'>
						<p className={`error-val ${theme}`}>{error}</p>
						{errorDetails
							.filter((key) => key.toLowerCase() !== 'message') // Message is rendered separately
							.map((key: string, index: number) => (
								<div className='d-flex' key={index}>
									<p className={`error-title ${theme}`}>
										{captializeFirstLetterOfWords(key)}
									</p>
									<p className={`error-val ${theme}`}>{jsonError[key]}</p>
								</div>
							))}
					</div>
					<div className='modal-footer modal-footer-error'>
						<button
							type='button'
							className={`btn btn-close ${theme}`}
							onClick={() => props.setError('')}>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
