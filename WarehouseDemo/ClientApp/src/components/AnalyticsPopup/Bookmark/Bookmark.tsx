// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './Bookmark.scss';
import React, { useState, useContext, useRef, useEffect } from 'react';
import ThemeContext from '../../../themeContext';
import $ from 'jquery';

export interface BookmarkProp {
	captureBookmarkWithName: { (bookmarkName: string): void };
	onClick?: { (): void };
}

/**
 * Render Bookmark options in the popup
 */
export function Bookmark(props: BookmarkProp): JSX.Element {
	const theme = useContext(ThemeContext);

	const [inputText, setInputText] = useState<string>('');

	const invalidClass = 'is-invalid';
	// Cache DOM element
	const captureViewModal = $('#modal-capture-view');

	const bookmarkName = useRef<HTMLInputElement>();

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		setInputText(event.target.value);
	}

	function captureBookmarkOnClick(): void {
		// Checks whether the bookmark name entered is empty or not
		if (inputText.trim() === '') {
			// Invalid bookmark-name
			bookmarkName.current.classList.add(invalidClass);
			return;
		}
		bookmarkName.current.classList.remove(invalidClass);

		// Execute the function to save the bookmark
		props.captureBookmarkWithName(inputText);
		// Close the modal after saving the bookmark
		props.onClick();
		// Reset text box
		setInputText('');
	}

	captureViewModal.on('hidden.bs.modal', function () {
		// On modal close, remove the invalid class and reset the field
		const bookmarkText = document.getElementById('bookmark-name');
		if (bookmarkText) {
			bookmarkText.classList.remove(invalidClass);
		}
		// Reset text box
		setInputText('');
	});

	// On focus, remove the invalid class
	useEffect(() => {
		bookmarkName.current.addEventListener('focus', function () {
			bookmarkName.current.classList.remove(invalidClass);
		});
	}, []);

	return (
		<React.Fragment>
			<div className='modal-body'>
				<form className={`bookmark-form ${theme}`} noValidate>
					<p className={`input-title ${theme}`}>Enter a name for this view:</p>
					<input
						ref={bookmarkName}
						id='bookmark-name'
						type='text'
						placeholder='Example: May 2020 Sales Analytics'
						className={`form-control input-bookmark`}
						value={inputText}
						onChange={handleChange}
						required
					/>
					<div className='invalid-feedback'>Please provide a valid bookmark name</div>
				</form>
			</div>
			<div className='modal-footer text-center'>
				<button type='button' className='btn btn-submit' onClick={captureBookmarkOnClick}>
					Save
				</button>
			</div>
		</React.Fragment>
	);
}
