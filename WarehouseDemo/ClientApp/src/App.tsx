import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import './App.scss';
import React, { useState } from 'react';
import { Card } from './components/Card/Card';
import { EmbedPage } from './components/EmbedPage/EmbedPage';
import { SalesManager, SalesPerson } from './constants';

export enum Page {
	Home = 'home',
	Login = 'login',
	Embed = 'embed',
}

export enum Profile {
	SalesPerson = 'Sales Person',
	SalesManager = 'Sales Manager',
	Anonymous = 'Anonymous',
}

export default function App(): React.FunctionComponentElement<null> {
	// Check default for profile
	const [state, setState] = useState({
		page: Page.Home,
		profile: Profile.Anonymous,
	});

	const setProfileType = (profileType: Profile): void => {
		setState({ page: Page.Login, profile: profileType });
	};

	const homeOnClick = (): void => {
		setState({ ...state, page: Page.Home });
	};

	const loginOnClick = (): void => {
		// TODO: Add login check
		setState({ ...state, page: Page.Embed });
	};

	const logoutOnClick = (): void => {
		setState({ ...state, page: Page.Home });
	};

	const firstName =
		state.profile === Profile.SalesManager
			? SalesManager.firstName
			: SalesPerson.firstName;
	const lastName =
		state.profile === Profile.SalesManager
			? SalesManager.lastName
			: SalesPerson.lastName;

	// Select page to display
	let page: JSX.Element;
	switch (state.page) {
		case Page.Home:
			page = (
				<Card
					page={Page.Home}
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
					setProfileType={setProfileType}
					homeOnClick={homeOnClick}
					loginOnClick={loginOnClick}
				/>
			);
			break;
		case Page.Embed:
			page = (
				<EmbedPage
					profile={state.profile}
					firstName={firstName}
					lastName={lastName}
					logoutOnClick={logoutOnClick}
				/>
			);
			break;
	}

	return page;
}
