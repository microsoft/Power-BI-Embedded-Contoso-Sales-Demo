// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import './Export.scss';
import React, { useState, useContext } from 'react';
import { exportTypes, storageKeyJWT } from '../../../constants';
import { Bookmark, TabName, Theme, ServiceAPI, UpdateApp } from '../../../models';
import ThemeContext from '../../../themeContext';
import { getPageName, getStoredToken, checkTokenValidity, downloadFile } from '../../utils';
import { salesManagerTabs } from '../../../reportConfig';
import { Icon } from '../../Icon/Icon';

export interface ExportProp {
	isExportInProgress: boolean;
	setError: { (error: string): void };
	toggleExportProgressState: { (): void };
	selectedBookmark: Bookmark;
	updateApp: UpdateApp;
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
		// Get token from storage
		const storedToken = getStoredToken();

		// Check token expiry before making API request, redirect back to login page
		if (!checkTokenValidity(storedToken)) {
			alert('Session expired');

			// Re-render App component
			props.updateApp((prev: number) => prev + 1);
			return;
		}

		// To show waiting experience
		props.toggleExportProgressState();

		try {
			// Encoding bookmark state using base 64 to handle special characters during server side calls

			const reqParamsBody: string = JSON.stringify({
				pageName: reportPageName,
				fileFormat: radioSelection,
				pageState: props.selectedBookmark ? props.selectedBookmark.state : null,
			});

			const serverRes = await fetch(ServiceAPI.ExportReport, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${sessionStorage.getItem(storageKeyJWT)}`,
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

	let exportInfo: JSX.Element;
	if (theme === Theme.Dark) {
		exportInfo = (
			<div className='export-info d-flex align-items-center'>
				<div className='icon-export-info'>
					<Icon iconId='export-notice-dark' height={14} width={14} />
				</div>
				<div className='text-export-info align-items-center'>
					The color theme in light mode will be applied to the exported file.
				</div>
			</div>
		);
	}

	return (
		<React.Fragment>
			<div className={`modal-body ${theme}`}>
				<div className='input-container'>
					<p className={`input-title ${theme}`}>Select format:</p>
					{exportTypes.map((type: string, index: number) => (
						<div className='form-check form-check-inline mr-3' key={index}>
							<input
								type='radio'
								name='export-type'
								id={`radio-${type}`}
								className='form-check-input'
								checked={type === radioSelection}
								onClick={() => setRadioSelection(type)}
							/>
							<label
								className={`form-check-label export-type-label label-radio text-uppercase ${theme}`}
								htmlFor={`radio-${type}`}>
								{type}
							</label>
						</div>
					))}
				</div>
				{exportInfo}
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
 * Component for export in progress view
 */
function ExportInProgressView(): JSX.Element {
	const theme = useContext(ThemeContext);

	return (
		<div className='align-items-center d-flex modal-body justify-content-center wait-container'>
			<div className={`spinner-border spinner-export ${theme}`} role='status'>
				<span className='sr-only'>Loading...</span>
			</div>
			<div>
				<p className={`wait-message ${theme}`}>The download will start automatically.</p>
				<p className={`wait-message ${theme}`}>You may close this dialog box.</p>
			</div>
		</div>
	);
}
