// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import { Report, VisualDescriptor, Page } from 'powerbi-client';
import Moment from 'moment';
import { Bookmark } from './EmbedPage/EmbedPage';
import { TabConfig } from './tabConfig';

/**
 * Get all the visuals for the given powerbi report page.
 * @param page The report page from where the visuals should be fetched
 * @param callbackfn Callback method with list of report visuals as param
 */
export async function getVisualsFromPage(
	page: Page,
	callbackfn?: { (visuals?: VisualDescriptor[]): void }
): Promise<void> {
	try {
		// Get the visuals from the page
		const visuals = await page.getVisuals();
		callbackfn(visuals);
	} catch (reason) {
		console.error(reason);
	}
}

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

		const bookmarks: Bookmark[] = reportBookmarks.map((reportBookmark) => {
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
 * @returns formatted date in the form of string
 */
export function getFormattedDate(date: Date): string {
	return Moment(date).format('dddd, MMMM DD, yyyy');
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
		if (mins == 0) minsText += mins + '0';
		else minsText += mins;
		timeOptions.push(hours + ':' + minsText + ' ' + meridiem);
		mins += 30;
		if (i % 2 != 0) {
			hours++;
			mins = 0;
		}
	}
	return timeOptions;
}
