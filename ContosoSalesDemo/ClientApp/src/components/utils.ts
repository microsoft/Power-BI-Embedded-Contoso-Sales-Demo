// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import React, { MutableRefObject } from 'react';
import { Report, Page } from 'powerbi-client';
import { decode } from 'jsonwebtoken';
import { storageKeyJWT, tokenExpiryKey } from '../constants';
import { Bookmark, TabConfig, DateFormat } from '../models';

/**
 * Gets current active page from the given report
 * @param powerbiReport
 * @returns active page instance
 */
export async function getActivePage(powerbiReport: Report): Promise<Page> {
	const pages = await powerbiReport.getPages();

	// Find active page
	const activePage = pages.find((page) => {
		return page.isActive;
	});

	return activePage;
}

/**
 * Gets bookmarks that are defined in the report
 * @param report
 * @param callbackfn
 */
export async function getBookmarksFromReport(
	report: Report,
	callbackfn?: { (bookmarks?: Bookmark[]): void }
): Promise<void> {
	if (!report) {
		return;
	}
	try {
		const reportBookmarks = await report?.bookmarksManager.getBookmarks();

		// Filter bookmarks which have state, to exclude bookmark directories
		const reportBookmarksWithState = reportBookmarks.filter((bookmark) => bookmark.state);

		const bookmarks: Bookmark[] = reportBookmarksWithState.map((reportBookmark) => {
			return {
				...reportBookmark,
				checked: false,
			};
		});
		callbackfn(bookmarks);
	} catch (error) {
		console.error(error);
	}
}

/**
 * Gets all the pages from the report
 * @param report instance
 */
export async function getPagesFromReport(report: Report): Promise<Page[]> {
	if (!report) {
		return;
	}

	try {
		return await report.getPages();
	} catch (error) {
		console.error(error);
	}
}

/**
 * Returns the report page name of the specified tab
 * @param tabName
 * @param tabConfig
 */
export function getPageName(tabName: string, tabConfig: TabConfig[]): string {
	const tab = tabConfig.find((tabs) => {
		return tabs.name === tabName;
	});
	return tab.reportPageName;
}

/**
 * Returns the bookmark that is currently applied on the embedded report
 * @param bookmarks
 */
export function getSelectedBookmark(bookmarks: Bookmark[]): Bookmark {
	return bookmarks.find((bookmark) => {
		return bookmark.checked;
	});
}

/**
 * Returns stored jwt token from session storage or null when no token found
 */
export function getStoredToken(): string | null {
	const storageValueJWT = sessionStorage.getItem(storageKeyJWT);

	return storageValueJWT;
}

/**
 * Returns true when the given token is currently active (not expired), false otherwise
 * @param jwt Token
 */
export function checkTokenValidity(jwt: string): boolean {
	// JWT token not present
	if (!jwt) {
		return false;
	}

	// Get token expiry property from token payload
	const tokenExpiryString = getTokenPayloadProperty(jwt, tokenExpiryKey);

	// Expiry time not found on the token payload
	if (!tokenExpiryString) {
		return false;
	}

	// Convert to number
	const tokenExpiry: number = +tokenExpiryString;

	// Check if token expiry property is not a number
	if (Number.isNaN(tokenExpiry)) {
		return false;
	}

	// Convert to milliseconds
	const tokenExpiryMS = tokenExpiry * 1000;

	// Check if token is expired
	return Date.now() <= tokenExpiryMS;
}

/**
 * Returns the decoded object of payload/claim of the given token
 * @param jwt Token
 */
export function getTokenPayload(jwt: string): { [key: string]: string } {
	// JWT token not present
	if (!jwt) {
		return null;
	}

	return decode(jwt, { json: true });
}

/**
 * Returns the given property value in token payload if it exists, null otherwise
 * @param jwt Token
 */
export function getTokenPayloadProperty(jwt: string, property: string): string | null {
	// JWT token not present
	if (!jwt) {
		return null;
	}

	const decodedPayloadObject: Record<string, string> = getTokenPayload(jwt);

	// Return null if decodedPayloadObject or given property in decodedPayloadObject does not exists
	if (!decodedPayloadObject || !(property in decodedPayloadObject)) {
		return null;
	}

	// Return the given property value
	return decodedPayloadObject[property];
}

/**
 * Converts base64 string to Uint8Array array
 * @param base64 string
 */
export function base64ToArrayBuffer(base64: string): Uint8Array {
	const binaryString = window.atob(base64);
	const binaryLen = binaryString.length;
	const bytes = new Uint8Array(binaryLen);

	for (let idx = 0; idx < binaryLen; idx++) {
		const ascii = binaryString.charCodeAt(idx);
		bytes[idx] = ascii;
	}

	return bytes;
}

/**
 * Downloads the file in the JSON object
 * @param fileData file JSON object
 */
export function downloadFile(fileData: { [key: string]: string }): void {
	console.info('Starting download process');

	try {
		// Create blob for file contents of given content type
		const blob = new Blob([base64ToArrayBuffer(fileData.fileContents)], {
			type: fileData.contentType,
		});

		// Creating an object URL
		const URL = window.URL || window.webkitURL;
		const dataUrl = URL.createObjectURL(blob);

		// Downloading the file using the object URL by using anchor element
		const element = document.createElement('a');
		element.setAttribute('class', 'download-anchor');
		element.setAttribute('href', dataUrl);
		element.setAttribute('download', fileData.fileDownloadName);
		document.body.appendChild(element);
		element.click();

		// Deleting the object URL and anchor element
		document.body.removeChild(element);
		URL.revokeObjectURL(dataUrl);
	} catch (error) {
		console.error('Error downloading file', error.toString());
	}
}

/**
 * General function to captialize first letter of every space separated word
 * @param words sentence of words
 * @returns first letter capital for each word in the string
 */
export function captializeFirstLetterOfWords(words: string): string {
	return words
		.split(' ')
		.map((word) => word.substring(0, 1).toUpperCase() + word.substring(1))
		.join(' ');
}

/**
 * Returns the formatted date required by the forms
 * @param date date to be formatted
 * @param format date format type
 * @returns formatted date in the form of string
 */
export function getFormattedDate(date: Date, format: DateFormat): string {
	// Adjust local date according to UTC
	const localDate = new Date(date);
	localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
	switch (format) {
		case DateFormat.DayMonthDayYear:
			return date.toLocaleDateString(undefined, {
				day: '2-digit',
				month: 'long',
				year: 'numeric',
				weekday: 'long',
			});
		case DateFormat.YearMonthDay:
			// Remove time from JSON formatted date eg.- '2020-05-15T00:00:00.000Z' converted to '2020-05-15'
			return localDate.toJSON().slice(0, -14);
		case DateFormat.YearMonthDayTime:
			// Remove milliseconds from JSON formatted date eg.- '2020-05-15T00:00:00.000Z' converted to '2020-05-15T00:00:00'
			return date.toJSON().slice(0, -5);
		default:
			return date.toString();
	}
}

/**
 * Returns the time array with 12-hour format
 * @returns array of time options as string
 */
export function createTimeOptions(): Array<string> {
	const timeOptions: Array<string> = [];
	let hours = 12;
	let mins = 0;
	let minsText = '';
	let meridiem = 'AM';
	for (let i = 0; i < 48; i++) {
		minsText = '';
		if (hours > 12) {
			hours = 1;
		}
		if (i >= 24) {
			meridiem = 'PM';
		}
		if (mins === 0) minsText += mins + '0';
		else minsText += mins;
		timeOptions.push(hours + ':' + minsText + ' ' + meridiem);
		mins += 30;
		if (i % 2 !== 0) {
			hours++;
			mins = 0;
		}
	}
	return timeOptions;
}

/**
 * Returns the calculated hours and minutes with 24-hour format
 * @param timeString time in 12-hour format as string
 * @returns array of hours and minutes as numbers
 */
export function getCalculatedTime(timeString: string): [number, number] {
	const time = timeString.split(/[: ]/);
	const hr = parseInt(time[0]);
	const min = parseInt(time[1]);
	let calculatedHr: number = hr;
	if (time[2] === 'PM' && hr !== 12) {
		calculatedHr = hr + 12;
	} else if (time[2] === 'AM' && hr === 12) {
		calculatedHr = 0;
	}
	return [calculatedHr, min];
}

/**
 * Custom hook for components who require an action when clicked outside them
 * @param ref Wrapper component
 * @param callback Action to perform when clicked outside
 */
export const useClickOutside = (ref: MutableRefObject<HTMLDivElement>, callback: { (): void }): void => {
	const handleClick = (event) => {
		if (ref.current && !ref.current.contains(event.target)) {
			callback();
		}
	};
	React.useEffect(() => {
		document.addEventListener('click', handleClick);
		return () => {
			document.removeEventListener('click', handleClick);
		};
	});
};

/**
 * Function to trim the values entered in the textbox
 * @param event Get the event instance
 */
export function trimInput(event: React.FocusEvent<HTMLInputElement>): void {
	event.target.value = event.target.value.trim();
}

/**
 * Function to remove '{' and '}' from entity id returned from report
 * @param inputString Entity Id
 */
export function removeWrappingBraces(inputString: string): string {
	return inputString.replace(/{/g, '').replace(/}/g, '');
}

/**
 * Function to set form field values with the values returned from report
 * @param preFilledValuesObject object returned from report with values of data point
 * @param tableFieldValuesObject object to set with values returned from report
 */
export function setPreFilledValues(preFilledValuesObject: object, tableFieldValuesObject: object): void {
	Object.keys(preFilledValuesObject).map((index) => {
		Object.keys(tableFieldValuesObject).map((key) => {
			if (preFilledValuesObject[index].target.column === tableFieldValuesObject[key].name) {
				return (tableFieldValuesObject[key].value = preFilledValuesObject[index].equals);
			}
		});
	});
}
