import './Login.scss';
import React from 'react';

export interface LoginProps {
	homeOnClick: {
		(event?: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	};
	loginOnClick: {
		(event?: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	};
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
				<input
					type='text'
					placeholder='Username'
					className='col-lg-10 col-md-10 col-sm-12 form-control mb-3 offset-lg-1 offset-md-1'
				/>
			</div>

			<div className='form-group has-feedback'>
				<span className='form-control-feedback set-icon'>
					<img
						src={require('../../assets/Icons/lock.svg')}
						alt='Lock icon'
						className='input-icon'
					/>
				</span>
				<input
					type='password'
					placeholder='***********'
					className='col-lg-10 col-md-10 col-sm-12 form-control mb-3 offset-lg-1 offset-md-1'
				/>
			</div>

			<div id='btn-wrapper' className='no-gutters row'>
				<button
					id='back-btn'
					onClick={props.homeOnClick}
					className='col-lg-4 col-md-4 col-sm-5 offset-lg-1 offset-md-1'>
					BACK
				</button>
				<button
					id='login-btn'
					onClick={props.loginOnClick}
					className='col-lg-4 col-md-4 col-sm-5 offset-lg-2 offset-md-2 offset-sm-2'>
					SIGN IN
				</button>
			</div>
		</div>
	);
}
