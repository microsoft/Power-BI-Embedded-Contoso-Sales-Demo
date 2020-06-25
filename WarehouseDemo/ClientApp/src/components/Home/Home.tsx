import './Home.scss';
import React from 'react';
import { Profile } from '../../App';

export interface HomeProps {
	setProfileType: { (profileType: Profile): void };
}

export function Home(props: HomeProps): JSX.Element {
	return (
		<div className='card-body'>
			<p className='card-title'>Sign-in</p>

			<p className='card-text'>Select type of user</p>

			<button
				id='salesperson-btn'
				onClick={() => props.setProfileType(Profile.SalesPerson)}
				className='btn-block col-lg-10 col-md-10 col-sm-12 offset-lg-1 offset-md-1'>
				Sales Person
			</button>

			<button
				id='salesmanager-btn'
				onClick={() => props.setProfileType(Profile.SalesManager)}
				className='btn-block col-lg-10 col-md-10 col-sm-12 offset-lg-1 offset-md-1'>
				Sales Manager
			</button>
		</div>
	);
}
