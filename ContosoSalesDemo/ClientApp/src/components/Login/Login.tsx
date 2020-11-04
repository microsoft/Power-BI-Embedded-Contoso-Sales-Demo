// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import './Login.scss';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '../Icon/Icon';
import { storageKeyJWT } from '../../constants';
import { AuthResponse, Profile, ServiceAPI, UpdateApp } from '../../models';

export interface LoginProps {
	backToHomeOnClick: {
		(event?: React.MouseEvent<HTMLElement, MouseEvent>): void;
	};
	selectedProfile: Profile;
	updateApp: UpdateApp;
}

export interface LoginFormProps {
	username: string;
	password: string;
}

/**
 * DO NOT USE BELOW LOGIN IMPLEMENTATION FOR PRODUCTION APPLICATIONS,
 * THE CURRENT IMPLEMENTATION IS FOR DEMO PURPOSE ONLY!!
 */
export function Login(props: LoginProps): JSX.Element {
	const { register, handleSubmit } = useForm();

	async function loginOnClick(formData: LoginFormProps): Promise<void> {
		const { username, password } = formData;

		const loginSuccess: boolean = await loginUser(username, password, props.selectedProfile);
		if (!loginSuccess) {
			showLoginError();
		}

		// Re-render App component
		props.updateApp((prev: number) => prev + 1);
	}

	async function anonymousLoginOnClick(): Promise<void> {
		await loginUser(null, null, props.selectedProfile);
		// Re-render App component
		props.updateApp((prev: number) => prev + 1);
	}

	function showLoginError() {
		const authError = document.getElementsByClassName('auth-error-info')[0];
		authError.classList.remove('d-none');
		if (props.selectedProfile === Profile.SalesPerson) {
			authError.className += ' d-flex auth-error-info-salesperson';
		} else {
			authError.className += ' d-flex auth-error-info-salesmanager';
		}
	}

	function hideLoginError() {
		const authError = document.getElementsByClassName('auth-error-info')[0];
		authError.classList.remove('d-flex');
		authError.classList.add('d-none');
	}

	return (
		<form className='card-body' onSubmit={handleSubmit(loginOnClick)}>
			<div className='form-group has-feedback'>
				<span className='form-control-feedback set-icon'>
					<Icon className='input-icon' iconId='user' width={12} height={16} />
				</span>
				<input
					name='username'
					ref={register}
					type='text'
					onChange={() => {
						hideLoginError();
					}}
					placeholder='Username'
					className='form-control form-input m-top'
					required
				/>
			</div>

			<div className='form-group has-feedback'>
				<span className='form-control-feedback set-icon'>
					<Icon className='input-icon' iconId='lock' width={15} height={19} />
				</span>
				<input
					name='password'
					ref={register}
					type='password'
					onChange={() => {
						hideLoginError();
					}}
					placeholder='***********'
					className='form-control form-input'
					required
				/>
			</div>

			<div className='no-gutters row btn-wrapper'>
				<button
					onClick={props.backToHomeOnClick}
					className='offset-lg-1 offset-md-1 back-btn'
					type='button'>
					BACK
				</button>
				<button className='offset-lg-2 offset-md-2 offset-sm-2 login-btn' type='submit'>
					LOGIN
				</button>
			</div>

			{props.selectedProfile === Profile.SalesPerson ? (
				<div className='btn-anonymous' onClick={anonymousLoginOnClick}>
					Enter in demo mode
				</div>
			) : null}

			<div className='d-none align-items-center auth-error-info'>
				<div className='icon-auth-error'>
					<Icon iconId='auth-error' height={16} width={16} />
				</div>
				<div className='align-items-center text-auth-error '>
					Login failed. Invalid username or password.
				</div>
			</div>
		</form>
	);
}

/**
 * DO NOT USE BELOW LOGIN IMPLEMENTATION FOR PRODUCTION APPLICATIONS,
 * THE CURRENT IMPLEMENTATION IS FOR DEMO PURPOSE ONLY!!
 */

/**
 * Authenticates the user credentials and stores the JWT token on successful authentication
 * @param username Input username
 * @param password Input password
 * @param selectedProfile profile type selected on home page
 * @returns Flag whether login succeeded
 */
async function loginUser(username: string, password: string, selectedProfile: string): Promise<boolean> {
	const requestHeaders = new Headers({
		'Content-Type': 'application/json',
	});

	// Not anonymous login
	if (username && password && selectedProfile) {
		username = username.trim();
		password = password.trim();

		// Check empty strings after trim
		if (username === '' || password === '') {
			return false;
		}

		// Encode credentials in base64
		const encodedCreds = window.btoa(`${username}:${password}`);

		// Add encodedCreds to request header
		requestHeaders.append('Authorization', `Basic ${encodedCreds}`);
	}

	// Authenticate and fetch jwt token
	const serviceRes = await fetch(ServiceAPI.Authenticate, {
		method: 'POST',
		credentials: 'same-origin',
		headers: requestHeaders,
		body: JSON.stringify({ role: selectedProfile }),
	});

	if (!serviceRes.ok) {
		return false;
	}

	const serviceResString = await serviceRes.text();

	// JSON object of service response
	const authResponse: AuthResponse = await JSON.parse(serviceResString);

	// Store token in storage
	if (authResponse?.access_token) {
		sessionStorage.setItem(storageKeyJWT, authResponse.access_token);
		return true;
	}

	return false;
}
