// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import React from 'react';

export interface SettingsDropdownProps {
	showPersonaliseBar: boolean;
	personaliseBarOnClick: { (): void };
	logoutOnClick: { (): void };
}

export function SettingsDropdown(props: SettingsDropdownProps): JSX.Element {
	return (
		<div id='settings-dropdown' className='border-0 dropdown-menu shadow'>
			{props.showPersonaliseBar ? (
				<div className='dropdown-item' onClick={props.personaliseBarOnClick}>
					Personalize Home
				</div>
			) : null}
			<div className='dropdown-item'>Color Theme</div>
			<div className='dropdown-item'>Support</div>
			<div className='dropdown-item'>About</div>
			<div className='dropdown-item' onClick={props.logoutOnClick}>
				Sign out
			</div>
		</div>
	);
}
