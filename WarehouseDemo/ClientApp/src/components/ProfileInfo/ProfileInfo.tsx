import './ProfileInfo.scss';
import React from 'react';
import { Profile } from '../../App';

export interface ProfileInfoProps {
	firstName: string;
	lastName: string;
	profile: Profile;
}

export function ProfileInfo(props: ProfileInfoProps): JSX.Element {
	return (
		<div className='d-flex flex-column justify-content-start'>
			<div className='username'>
				{props.firstName + ' ' + props.lastName}
			</div>
			<div className='profile-info'>{props.profile}</div>
		</div>
	);
}
