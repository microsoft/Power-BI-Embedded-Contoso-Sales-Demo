import './IconBar.scss';
import React from 'react';
import { SettingsDropdown, SettingsDropdownProps } from '../SettingsDropdown';
import { ProfileInfo } from '../ProfileInfo/ProfileInfo';
import { Profile } from '../../App';

export interface IconBarProps extends SettingsDropdownProps {
	firstName: string;
	lastName: string;
	profile: Profile;
}

export function IconBar(props: IconBarProps): JSX.Element {
	let profilePicName: string;

	switch (props.profile) {
		case Profile.SalesManager:
			profilePicName = 'salesmanager-profile.svg';
			break;
		case Profile.SalesPerson:
			profilePicName = 'salesperson-profile.svg';
			break;
		case Profile.Anonymous:
			profilePicName = 'anonymous-profile.svg';
			break;
	}

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
					src={require(`../../assets/Images/${profilePicName}`)}
					alt='Profile photo'
					className='nav-icon'
				/>
			</div>
			<div className='user-info'>
				<ProfileInfo
					firstName={props.firstName}
					lastName={props.lastName}
					profile={props.profile}
				/>
			</div>
		</div>
	);
}
