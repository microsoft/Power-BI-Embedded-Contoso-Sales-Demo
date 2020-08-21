// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './SettingsDropdown.scss';
import React, { useState, useContext } from 'react';
import ThemeContext from '../../themeContext';
import { storageKeyJWT } from '../../constants';
import { useClickOutside } from '../utils';
import { Theme } from '../../models';

export interface SettingsDropdownProps {
	showPersonaliseBar: boolean;
	personaliseBarOnClick: { (): void };
	theme: Theme;
	applyTheme: { (theme: Theme): void };
	updateApp: Function;
}

export function SettingsDropdown(props: SettingsDropdownProps): JSX.Element {
	const settingsDropdownRef = React.useRef<HTMLDivElement>();
	useClickOutside(settingsDropdownRef, hideDropdown);

	/**
	 * Logout the user
	 */
	function logoutUser(): void {
		// Delete token in the store
		sessionStorage.removeItem(storageKeyJWT);
		props.updateApp((prev: number) => prev + 1);
	}

	/**
	 * Hide dropdown when clicked outside of it
	 */
	function hideDropdown() {
		// Check whether dropdown is open
		if (settingsDropdownRef.current.classList.contains('show')) {
			settingsDropdownRef.current.classList.remove('show');
		}
	}

	// State hook to toggle theme selector btns
	const [themeSelector, toggleThemeSelector] = useState<boolean>(false);

	const theme: Theme = useContext(ThemeContext);

	const dropdownItemClass = `dropdown-item non-selectable ${theme}`;

	const themeRadioBtns = (
		<React.Fragment>
			<div className={` d-flex align-items-center theme-selector-container ${theme}`}>
				<div className='form-check form-check-inline m-right'>
					<input
						type='radio'
						id='theme-light'
						name='theme-selector'
						className='form-check-input radio-themes'
						value={'Light'}
						checked={props.theme === Theme.Light}
						onChange={() => props.applyTheme(Theme.Light)}
					/>
					<label className={`form-check-label ${theme}`} htmlFor={`theme-light`}>
						Light
					</label>
				</div>
				<div className='form-check form-check-inline m-right'>
					<input
						type='radio'
						id='theme-dark'
						name='theme-selector'
						className='form-check-input radio-themes'
						value={'Dark'}
						checked={props.theme === Theme.Dark}
						onChange={() => props.applyTheme(Theme.Dark)}
					/>
					<label className={`form-check-label ${theme}`} htmlFor={`theme-dark`}>
						Dark
					</label>
				</div>
			</div>
			<div className={`separator ${theme}`} />
		</React.Fragment>
	);

	return (
		<div id='settings-dropdown' ref={settingsDropdownRef} className={`border-0 dropdown-menu ${theme}`}>
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
				onClick={logoutUser}>
				Logout
			</div>
		</div>
	);
}
