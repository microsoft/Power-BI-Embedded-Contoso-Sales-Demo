// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import './IconBar.scss';
import React, { useContext } from 'react';
import { SettingsDropdown, SettingsDropdownProps } from '../SettingsDropdown/SettingsDropdown';
import { ProfileInfo, ProfileInfoProps } from '../ProfileInfo/ProfileInfo';
import { Icon } from '../Icon/Icon';
import ThemeContext from '../../themeContext';
import { Theme } from '../../models';

export interface IconBarProps extends SettingsDropdownProps, ProfileInfoProps {
	profileImageName: string;
}

export function IconBar(props: IconBarProps): JSX.Element {
	const theme: Theme = useContext(ThemeContext);
	const settingsIconDimension = 27;
	const profileIconDimension = 38;

	return (
		<div className='align-items-center d-flex flex-row icon-bar'>
			<div className='setting'>
				<Icon
					className='dropdown dropdown-toggle nav-icon'
					iconId={`settings-${theme}`}
					height={settingsIconDimension}
					width={settingsIconDimension}
					dataTarget='#settings-dropdown'
					dataToggle='collapse'
				/>

				<SettingsDropdown
					showPersonaliseBar={props.showPersonaliseBar}
					personaliseBarOnClick={props.personaliseBarOnClick}
					applyTheme={props.applyTheme}
					theme={props.theme}
					updateApp={props.updateApp}
				/>
			</div>

			<div className='user-profile'>
				<Icon
					// For production app, fetch profile image from the identity provider
					className='nav-icon rounded-img'
					iconId={props.profileImageName}
					width={profileIconDimension}
					height={profileIconDimension}
				/>
			</div>

			<div className='user-info'>
				<ProfileInfo name={props.name} profile={props.profile} />
			</div>
		</div>
	);
}
