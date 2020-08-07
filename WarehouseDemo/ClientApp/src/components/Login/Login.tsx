// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './Login.scss';
import React from 'react';
import { Profile } from '../../App';

export interface LoginProps {
	homeOnClick: {
		(event?: React.MouseEvent<HTMLElement, MouseEvent>): void;
	};
	loginOnClick: {
		(event?: React.MouseEvent<HTMLElement, MouseEvent>): void;
	};
	anonymousLoginOnClick?: { (): void };
	profile: Profile;
}

export function Login(props: LoginProps): JSX.Element {
	return (
		<div className='card-body'>
			<div className='form-group has-feedback'>
				<span className='form-control-feedback set-icon'>
					<img
						src={require('../../assets/Icons/user.svg')}
						alt='User icon'
						className='input-icon'
					/>
				</span>
				<input type='text' placeholder='Username' className='form-control form-input m-top' />
			</div>

			<div className='form-group has-feedback'>
				<span className='form-control-feedback set-icon'>
					<img
						src={require('../../assets/Icons/lock.svg')}
						alt='Lock icon'
						className='input-icon'
					/>
				</span>
				<input type='password' placeholder='***********' className='form-control form-input' />
			</div>

			<div className='no-gutters row btn-wrapper'>
				<button onClick={props.homeOnClick} className='offset-lg-1 offset-md-1 back-btn'>
					BACK
				</button>
				<button
					onClick={props.loginOnClick}
					className='offset-lg-2 offset-md-2 offset-sm-2 login-btn'>
					LOGIN
				</button>
			</div>

			{props.profile === Profile.SalesPerson ? (
				<div className='offset-lg-1 offset-md-1 btn-anonymous' onClick={props.anonymousLoginOnClick}>
					Enter in demo mode
				</div>
			) : null}
		</div>
	);
}
