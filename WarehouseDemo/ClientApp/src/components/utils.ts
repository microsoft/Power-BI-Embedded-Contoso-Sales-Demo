import { Report, VisualDescriptor } from 'powerbi-client';

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
