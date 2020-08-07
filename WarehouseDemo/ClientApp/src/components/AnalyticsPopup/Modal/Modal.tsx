// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './Modal.scss';
import '../../../App.scss';
import React, { useState, useContext } from 'react';
import { Report } from 'powerbi-client';
import { Bookmark, BookmarkProp } from '../Bookmark/Bookmark';
import { Export, ExportProp } from '../Export/Export';
import { Tab } from '../../NavTabs/NavTabs';
import ThemeContext from '../../../themeContext';

enum ModalTab {
	Bookmark = 'bookmark',
	Export = 'export',
}

// TODO: Use report object from props to capture and export report states
export interface ModalProps extends BookmarkProp, ExportProp {
	report: Report;
}

// List of tabs' name
const tabNames: Array<ModalTab> = [ModalTab.Bookmark, ModalTab.Export];

/**
 * Render Capture View popup
 * @param props ModalProps
 */
export function Modal(props: ModalProps): JSX.Element {
	const theme = useContext(ThemeContext);

	// State hook to set first tab as active
	const [activeTab, setActiveTab] = useState<Tab['name']>(() => {
		if (tabNames?.length > 0) {
			return tabNames[0];
		} else {
			return null;
		}
	});

	let modalBody: JSX.Element;
	if (activeTab === ModalTab.Bookmark) {
		modalBody = <Bookmark captureBookmarkWithName={props.captureBookmarkWithName} />;
	} else if (activeTab === ModalTab.Export) {
		modalBody = (
			<Export
				isExportInProgress={props.isExportInProgress}
				setError={props.setError}
				toggleExportProgressState={props.toggleExportProgressState}
				selectedBookmark={props.selectedBookmark}
			/>
		);
	}

	return (
		<div id='modal-capture-view' className='modal fade' role='dialog' data-backdrop='static'>
			<div className='modal-dialog modal-dialog-centered' role='document'>
				<div className={`modal-content ${theme}`}>
					<div className={`modal-header ${theme}`}>
						<nav className='navbar p-0'>
							<p
								className={`pb-1 modal-tab mr-5 ${
									activeTab === ModalTab.Bookmark ? 'modal-tab-active ' : ''
								}${theme}`}
								onClick={() => setActiveTab(ModalTab.Bookmark)}>
								{`Save to 'My Views'`}
							</p>
							<p
								className={`pb-1 modal-tab ${
									activeTab === ModalTab.Export ? 'modal-tab-active ' : ''
								}${theme}`}
								onClick={() => setActiveTab(ModalTab.Export)}>
								Export to File
							</p>
						</nav>
						<button
							type='button'
							className={`close p-0 ${theme}`}
							data-dismiss='modal'
							aria-label='Close'>
							<span aria-hidden='true'>&times;</span>
						</button>
					</div>
					{modalBody}
				</div>
			</div>
		</div>
	);
}
