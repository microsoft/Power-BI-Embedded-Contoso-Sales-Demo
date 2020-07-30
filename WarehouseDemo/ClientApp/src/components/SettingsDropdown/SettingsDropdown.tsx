// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import React, { useState, useContext } from 'react';
import ThemeContext, { Theme } from '../../themeContext';
import './SettingsDropdown.scss';

export interface SettingsDropdownProps {
	showPersonaliseBar: boolean;
	personaliseBarOnClick: { (): void };
	logoutOnClick: { (): void };
	theme: Theme;
	applyTheme: { (theme: Theme): void };
}

export function SettingsDropdown(props: SettingsDropdownProps): JSX.Element {
	// State hook to toggle theme selector btns
	const [themeSelector, toggleThemeSelector] = useState<boolean>(false);

	const theme: Theme = useContext(ThemeContext);

	const dropdownItemClass = `dropdown-item ${theme}`;

	// TODO: BG color for radio button needs to be as correct
	const themeRadioBtns = (
		<div className={`theme-selector-container ${theme}`}>
			<label className='theme-label'>
				<input
					type='radio'
					className='theme-selector'
					data-toggle='collapse'
					data-target='#settings-dropdown'
					value={'Light'}
					checked={props.theme === Theme.Light}
					onChange={() => props.applyTheme(Theme.Light)}
				/>
				<span className={`checkmark ${theme}`}></span>
				<p className='label'>Light</p>
			</label>

			<label className='theme-label'>
				<input
					type='radio'
					className='theme-selector'
					data-toggle='collapse'
					data-target='#settings-dropdown'
					value={'Dark'}
					checked={props.theme === Theme.Dark}
					onChange={() => props.applyTheme(Theme.Dark)}
				/>
				<span className={`checkmark ${theme}`}></span>
				<p className='label'>Dark</p>
			</label>
		</div>
	);

	return (
		<div id='settings-dropdown' className={`border-0 dropdown-menu shadow ${theme}`}>
			{props.showPersonaliseBar ? (
				<div
					className={dropdownItemClass}
					data-toggle='collapse'
					data-target='#settings-dropdown'
					onClick={props.personaliseBarOnClick}>
					Personalize Home
				</div>
			) : null}
			<div className={dropdownItemClass} onClick={() => toggleThemeSelector(!themeSelector)}>
				Colour Theme
			</div>

			{themeSelector ? themeRadioBtns : null}
			<div className={dropdownItemClass} data-toggle='collapse' data-target='#settings-dropdown'>
				Support
			</div>
			<div className={dropdownItemClass} data-toggle='collapse' data-target='#settings-dropdown'>
				About
			</div>
			<div
				className={dropdownItemClass}
				data-toggle='collapse'
				data-target='#settings-dropdown'
				onClick={props.logoutOnClick}>
				Sign out
			</div>
		</div>
	);
}
