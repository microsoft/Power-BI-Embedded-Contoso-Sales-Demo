// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './SettingsDropdown.scss';
import React, { useState, useContext } from 'react';
import ThemeContext, { Theme } from '../../themeContext';

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

	const themeRadioBtns = (
		<React.Fragment>
			<div className={`theme-selector-container ${theme}`}>
				<div className='custom-control custom-radio custom-control-inline m-right'>
					<input
						type='radio'
						id='theme-light'
						name='theme-selector'
						className='custom-control-input'
						value={'Light'}
						checked={props.theme === Theme.Light}
						onChange={() => props.applyTheme(Theme.Light)}
					/>
					<label
						className={`custom-control-label label-radio theme-type-label ${theme}`}
						htmlFor={`theme-light`}>
						Light
					</label>
				</div>
				<div className='custom-control custom-radio custom-control-inline m-right'>
					<input
						type='radio'
						id='theme-dark'
						name='theme-selector'
						className='custom-control-input'
						value={'Dark'}
						checked={props.theme === Theme.Dark}
						onChange={() => props.applyTheme(Theme.Dark)}
					/>
					<label
						className={`custom-control-label label-radio theme-type-label ${theme}`}
						htmlFor={`theme-dark`}>
						Dark
					</label>
				</div>
			</div>
			<div className={`separator ${theme}`} />
		</React.Fragment>
	);

	return (
		<div id='settings-dropdown' className={`border-0 dropdown-menu ${theme}`}>
			{props.showPersonaliseBar ? (
				<div
					className={dropdownItemClass}
					data-toggle='collapse'
					data-target='#settings-dropdown'
					onClick={props.personaliseBarOnClick}>
					Personalize Home
				</div>
			) : null}
			<div
				className={`${dropdownItemClass} ${themeSelector ? 'selected' : ''}`}
				onClick={() => toggleThemeSelector(!themeSelector)}>
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
