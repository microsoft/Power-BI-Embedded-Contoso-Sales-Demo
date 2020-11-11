// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import './App.scss';
import React, { useState } from 'react';
import { Card } from './components/Card/Card';
import { EmbedPage } from './components/EmbedPage/EmbedPage';
import { AnonymousUser, SalesManager, Salesperson } from './constants';
import { getStoredToken, checkTokenValidity, getTokenPayload } from './components/utils';
import { Profile } from './models';

export default function App(): React.FunctionComponentElement<null> {
	// This state is used to re-render the app to switch between pages, state value is never used
	const [state, setState] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars

	// Get token from storage
	const storedToken = getStoredToken();

	// Invalid token and render login page to get a new valid token
	if (!checkTokenValidity(storedToken)) {
		return <Card updateApp={setState} />;
	}

	// Get user data
	const tokenPayload = getTokenPayload(storedToken);

	const username: string = tokenPayload.username;
	const role: string = tokenPayload.role;
	const name: string = tokenPayload.name;

	let profileType: Profile;
	let profileImageName: string;

	// For production application, get these values from identity provider
	switch (role) {
		case Profile.SalesManager:
			profileType = Profile.SalesManager;
			profileImageName = SalesManager.profileImageName;
			break;

		case Profile.Salesperson:
			profileType = Profile.Salesperson;
			if (username) {
				profileImageName = Salesperson.profileImageName;
			} else {
				profileImageName = AnonymousUser.profileImageName;
			}
			break;

		default:
			console.error('Profile type is not valid');
			// Redirect to login again
			return <Card updateApp={setState} />;
	}

	return (
		<EmbedPage
			profile={profileType}
			name={name}
			profileImageName={profileImageName}
			updateApp={setState}
		/>
	);
}
