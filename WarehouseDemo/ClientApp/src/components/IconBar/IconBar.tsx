// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './IconBar.scss';
import React from 'react';
import { SettingsDropdown, SettingsDropdownProps } from '../SettingsDropdown/SettingsDropdown';
import { ProfileInfo, ProfileInfoProps } from '../ProfileInfo/ProfileInfo';

export interface IconBarProps extends SettingsDropdownProps, ProfileInfoProps {
	profileImageName: string;
}

export function IconBar(props: IconBarProps): JSX.Element {
	return (
		<div className='align-items-center d-flex flex-row icon-bar'>
			<div className='setting'>
				<img
					id='options-icon'
					src={require('../../assets/Icons/setting.svg')}
					alt='More options'
					data-toggle='dropdown'
					className='dropdown dropdown-toggle nav-icon'
				/>
				<SettingsDropdown
					showPersonaliseBar={props.showPersonaliseBar}
					personaliseBarOnClick={props.personaliseBarOnClick}
					logoutOnClick={props.logoutOnClick}
				/>
			</div>

			<div className='user-profile'>
				<img
					src={require(`../../assets/Images/${props.profileImageName}`)}
					alt='Profile photo'
					className='nav-icon'
				/>
			</div>

			<div className='user-info'>
				<ProfileInfo firstName={props.firstName} lastName={props.lastName} profile={props.profile} />
			</div>
		</div>
	);
}
