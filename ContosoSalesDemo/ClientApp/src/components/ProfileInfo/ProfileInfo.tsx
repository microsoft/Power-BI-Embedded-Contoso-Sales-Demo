// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import './ProfileInfo.scss';
import React, { useContext } from 'react';
import ThemeContext from '../../themeContext';
import { Profile } from '../../models';

export interface ProfileInfoProps {
	name: string;
	profile: Profile;
}

export function ProfileInfo(props: ProfileInfoProps): JSX.Element {
	const theme = useContext(ThemeContext);
	return (
		<div className='d-flex flex-column justify-content-start'>
			<div
				className={`username d-inline-block text-truncate cursor-default non-selectable ${theme}`}
				title={props.name}>
				{props.name}
			</div>
			<div className={`profile-info cursor-default non-selectable ${theme}`} title={props.profile}>
				{props.profile}
			</div>
		</div>
	);
}
