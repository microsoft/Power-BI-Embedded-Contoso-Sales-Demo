// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import React, { useState, useContext } from 'react';
import ThemeContext from '../../../themeContext';
import $ from 'jquery';

export interface BookmarkProp {
	captureBookmarkWithName: { (bookmarkName: string): void };
}

/**
 * Render Bookmark options in the popup
 */
export function Bookmark(props: BookmarkProp): JSX.Element {
	const theme = useContext(ThemeContext);

	const [inputText, setInputText] = useState<string>('');

	// Cache DOM elements
	const invalidClass = 'is-invalid';
	const bookmarkName = $('#bookmark-name');
	const captureViewModal = $('#modal-capture-view');

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		setInputText(event.target.value);
	}

	function captureBookmarkOnClick(): void {
		// Checks whether the bookmark name entered is empty or not
		if (inputText.trim() === '') {
			// Invalid bookmark-name
			bookmarkName.addClass(invalidClass);
			return;
		}
		bookmarkName.removeClass(invalidClass);

		// Execute the function to save the bookmark
		props.captureBookmarkWithName(inputText);
		captureViewModal.modal('hide');
		// Reset text box
		setInputText('');
	}

	captureViewModal.on('hidden.bs.modal', function () {
		// On modal close, remove the invalid class and reset the field
		bookmarkName.removeClass(invalidClass);
		// Reset text box
		setInputText('');
	});

	// On focus, remove the invalid class
	bookmarkName.on('focus', function () {
		bookmarkName.removeClass(invalidClass);
	});

	return (
		<React.Fragment>
			<div className='modal-body'>
				<form noValidate>
					<p className={`input-title ${theme}`}>Enter a name for this view:</p>
					<input
						id='bookmark-name'
						type='text'
						placeholder='Example: May 2020 Sales Analytics'
						className='form-control'
						value={inputText}
						onChange={handleChange}
						required
					/>
					<div className='invalid-feedback'>Please provide a valid bookmark name</div>
				</form>
			</div>
			<div className='modal-footer text-center'>
				<button type='button' className='btn-submit' onClick={captureBookmarkOnClick}>
					Save
				</button>
			</div>
		</React.Fragment>
	);
}
