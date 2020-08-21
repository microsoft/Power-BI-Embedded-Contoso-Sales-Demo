// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './Card.scss';
import React, { useState } from 'react';
import { Home } from '../Home/Home';
import { Login, LoginProps } from '../Login/Login';
import { Icon } from '../Icon/Icon';
import { Profile } from '../../models';

interface CardsProps {
	updateApp: LoginProps['updateApp'];
}

export function Card(props: CardsProps): JSX.Element {
	const [selectedProfile, setSelectedProfile] = useState<Profile>(null);

	// Get back to home
	const homeOnClick = (): void => {
		setSelectedProfile(null);
	};

	// Show profile selector page (<Home>) when no profile is selected, else show <Login> page
	let cardBody: JSX.Element;
	if (selectedProfile === null) {
		cardBody = <Home setProfileType={setSelectedProfile} />;
	} else {
		cardBody = (
			<Login
				backToHomeOnClick={homeOnClick}
				selectedProfile={selectedProfile}
				updateApp={props.updateApp}
			/>
		);
	}

	return (
		<div className='gradient-bg'>
			<div className='card  mx-auto vertical-center'>
				<Icon className='card-img mx-auto' iconId='app-name-light' height={40} width={112} />

				{!selectedProfile ? <div className='horizontal-separator'></div> : null}

				{cardBody}
			</div>
		</div>
	);
}
