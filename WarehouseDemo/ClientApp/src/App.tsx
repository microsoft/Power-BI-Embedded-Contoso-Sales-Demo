import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import React, { useState } from 'react';
import { Card } from './components/Card/Card';

export enum Page {
	Home = 'home',
	Login = 'login',
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
		// TODO: Add login logic
	};

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
	}

	return page;
}
