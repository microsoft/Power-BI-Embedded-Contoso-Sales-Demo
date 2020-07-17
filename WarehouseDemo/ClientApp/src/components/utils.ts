// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import { Report, VisualDescriptor, Page } from 'powerbi-client';

/**
 * Get all the visuals for the given powerbi report.
 *
 * @param powerbiReport PowerBI Report instance
 * @param callbackfn Callback method with list of report visuals as param
 */
export async function getVisualsFromReport(
	powerbiReport: Report,
	callbackfn?: { (visuals?: VisualDescriptor[]): void }
): Promise<void> {
	try {
		const pages = await powerbiReport.getPages();
		const activePage = pages.find((page) => {
			return page.isActive;
		});
		const visuals = await activePage.getVisuals();
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
