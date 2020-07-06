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
			/>
		);
	}

	return (
		<div className='gradient-bg'>
			<div className='card col-lg-4 col-md-5 col-sm-8 mx-auto vertical-center'>
				<img
					src={require('../../assets/Images/app-name.svg')}
					alt='App name'
					className='card-img mx-auto'
				/>

				{cardBody}
			</div>
		</div>
	);
}
