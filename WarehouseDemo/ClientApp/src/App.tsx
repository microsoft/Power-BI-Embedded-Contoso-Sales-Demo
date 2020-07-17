// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import './App.scss';
import React, { useState } from 'react';
import { Card } from './components/Card/Card';
import { EmbedPage } from './components/EmbedPage/EmbedPage';
import { SalesManager, SalesPerson, AnonymousUser } from './constants';

export enum Page {
	Home = 'home',
	Login = 'login',
	Embed = 'embed',
}

export enum Profile {
	SalesPerson = 'Sales Person',
	SalesManager = 'Sales Manager',
}

export default function App(): React.FunctionComponentElement<null> {
	const [state, setState] = useState({
		page: Page.Home,
		profile: undefined,
	});

	const [anonymousLogin, setAnonymousLogin] = useState(false);

	const setProfileType = (profileType: Profile): void => {
		setState({ page: Page.Login, profile: profileType });
	};

	const homeOnClick = (): void => {
		setState({ ...state, page: Page.Home });
	};

	const loginOnClick = (): void => {
		// TODO: Add login check
		setState({ ...state, page: Page.Embed });
		setAnonymousLogin(false);
	};

	const anonymousLoginOnClick = (): void => {
		setState({ ...state, page: Page.Embed });
		setAnonymousLogin(true);
	};

	const logoutOnClick = (): void => {
		setState({ ...state, page: Page.Home });
	};

	let firstName: string;
	let lastName: string;
	let profileImageName: string;

	switch (state.profile) {
		case Profile.SalesManager:
			firstName = SalesManager.firstName;
			lastName = SalesManager.lastName;
			profileImageName = SalesManager.profileImageName;
			break;

		case Profile.SalesPerson:
			if (anonymousLogin) {
				firstName = AnonymousUser.firstName;
				lastName = AnonymousUser.lastName;
				profileImageName = AnonymousUser.profileImageName;
				break;
			}

			firstName = SalesPerson.firstName;
			lastName = SalesPerson.lastName;
			profileImageName = SalesPerson.profileImageName;
			break;
	}

	// Select page to display
	let page: JSX.Element;
	switch (state.page) {
		case Page.Home:
			page = (
				<Card
					page={Page.Home}
					profile={state.profile}
					setProfileType={setProfileType}
					homeOnClick={homeOnClick}
					loginOnClick={loginOnClick}
				/>
			);
			break;
		case Page.Login:
			page = (
				<Card
					page={Page.Login}
					profile={state.profile}
					setProfileType={setProfileType}
					homeOnClick={homeOnClick}
					loginOnClick={loginOnClick}
					anonymousLoginOnClick={anonymousLoginOnClick}
				/>
			);
			break;
		case Page.Embed:
			page = (
				<EmbedPage
					profile={state.profile}
					firstName={firstName}
					lastName={lastName}
					profileImageName={profileImageName}
					logoutOnClick={logoutOnClick}
				/>
			);
			break;
	}

	return page;
}
