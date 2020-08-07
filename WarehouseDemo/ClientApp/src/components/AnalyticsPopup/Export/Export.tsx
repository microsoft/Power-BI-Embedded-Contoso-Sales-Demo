// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './Export.scss';
import React, { useState, useContext } from 'react';
import { exportTypes, exportServerApi, exportedFileName, contentTypeMapping } from '../../../constants';
import { Bookmark } from '../../EmbedPage/EmbedPage';
import ThemeContext from '../../../themeContext';
import { getPageName, downloadFile } from '../../utils';
import { TabName, salesManagerTabs } from '../../tabConfig';

export interface ExportProp {
	isExportInProgress: boolean;
	setError: { (error: string): void };
	toggleExportProgressState: { (): void };
	selectedBookmark: Bookmark;
}

/**
 * Render Export options in the popup
 */
export function Export(props: ExportProp): JSX.Element {
	// Set PDF as the default export selection
	const [radioSelection, setRadioSelection] = useState<string>(
		exportTypes[0] // Set the default radio selection to first option
	);

	const theme = useContext(ThemeContext);

	const reportPageName = getPageName(TabName.Analytics, salesManagerTabs);

	/**
	 * Fetches exported file from server and downloads it
	 */
	async function exportService(): Promise<void> {
		// To show waiting experience
		props.toggleExportProgressState();

		try {
			// Encoding bookmark state using base 64 to handle special characters during server side calls

			const reqParamsBody: string = JSON.stringify({
				pageName: reportPageName,
				fileFormat: radioSelection,
				pageState: props.selectedBookmark ? props.selectedBookmark.state : null,
			});

			const serverRes = await fetch(exportServerApi, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: reqParamsBody,
			});

			const serverResString = await serverRes.text();

			if (!serverRes.ok) {
				// Show error popup if request fails
				props.setError(serverResString);
				console.error(`Failed to export report. Status: ${serverRes.status} ${serverRes.statusText}`);
			}

			downloadFile(await JSON.parse(serverResString));
		} catch (error) {
			console.error(`Error while exporting the report: ${error}`);
		}

		// Set export in progress state
		props.toggleExportProgressState();
	}

	// Show loading icon if previous export is in progress
	if (props.isExportInProgress) {
		return <ExportInProgressView />;
	}

	return (
		<React.Fragment>
			<div className='modal-body'>
				<div className='input-container'>
					<p className={`input-title ${theme}`}>Select format:</p>
					{exportTypes.map((type: string, index: number) => (
						<div className='custom-control custom-radio custom-control-inline mr-3' key={index}>
							<input
								type='radio'
								name='export-type'
								id={`radio-${type}`}
								className='custom-control-input'
								checked={type === radioSelection}
								onClick={() => setRadioSelection(type)}
							/>
							<label
								className={`custom-control-label export-type-label label-radio text-uppercase ${theme}`}
								htmlFor={`radio-${type}`}>
								{type}
							</label>
						</div>
					))}
				</div>
			</div>
			<div className='modal-footer'>
				<button type='button' className='btn btn-submit' onClick={exportService}>
					Export and Download
				</button>
			</div>
		</React.Fragment>
	);
}

/**
 * View for export in progress
 */
function ExportInProgressView(): JSX.Element {
	const theme = useContext(ThemeContext);

	return (
		<div className='align-items-center d-flex modal-body justify-content-center wait-container'>
			<div className={`spinner-border ${theme}`} role='status'>
				<span className='sr-only'>Loading...</span>
			</div>
			<div>
				<p className={`wait-message ${theme}`}>The download will start automatically.</p>
				<p className={`wait-message ${theme}`}>You may close this dialog box.</p>
			</div>
		</div>
	);
}
