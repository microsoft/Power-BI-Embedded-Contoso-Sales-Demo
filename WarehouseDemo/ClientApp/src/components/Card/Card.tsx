// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './Card.scss';
import React from 'react';
import { Home, HomeProps } from '../Home/Home';
import { Login, LoginProps } from '../Login/Login';
import { Page } from '../../App';

export interface CardProps extends LoginProps, HomeProps {
	page: Page;
}

export function Card(props: CardProps): JSX.Element {
	let cardBody: JSX.Element;
	if (props.page === Page.Home) {
		cardBody = <Home setProfileType={props.setProfileType} />;
	} else if (props.page === Page.Login) {
		cardBody = (
			<Login
				homeOnClick={props.homeOnClick}
				loginOnClick={props.loginOnClick}
				profile={props.profile}
				anonymousLoginOnClick={props.anonymousLoginOnClick}
			/>
		);
	}

	return (
		<div className='gradient-bg'>
			<div className='card  mx-auto vertical-center'>
				<img
					src={require('../../assets/Images/app-name-light.svg')}
					alt='App name'
					className='card-img mx-auto'
				/>

				{props.page === Page.Home ? <div className='horizontal-separator'></div> : null}

				{cardBody}
			</div>
		</div>
	);
}
