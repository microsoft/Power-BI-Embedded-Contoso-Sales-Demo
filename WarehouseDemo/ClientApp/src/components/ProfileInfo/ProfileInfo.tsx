// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './ProfileInfo.scss';
import React, { useContext } from 'react';
import { Profile } from '../../App';
import ThemeContext from '../../themeContext';

export interface ProfileInfoProps {
	firstName: string;
	lastName: string;
	profile: Profile;
}

export function ProfileInfo(props: ProfileInfoProps): JSX.Element {
	const theme = useContext(ThemeContext);
	return (
		<div className='d-flex flex-column justify-content-start'>
			<div className={`username d-inline-block text-truncate ${theme}`}>
				{props.firstName + ' ' + props.lastName}
			</div>
			<div className={`profile-info ${theme}`}>{props.profile}</div>
		</div>
	);
}
