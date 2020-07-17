// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './Footer.scss';
import React from 'react';
import { powerBiIconAltName, gitHubIconAltName } from '../../constants';

export function Footer(): JSX.Element {
	return (
		<div className='d-flex justify-content-center align-items-center footer'>
			<p>This sample is powered by Power BI Embedded |</p>
			<img src={require('../../assets/Icons/powerbi.svg')} alt={powerBiIconAltName} />
			<p>
				{'Explore our'}
				<a className='d-block' href='https://aka.ms/pbijs/' target='_blank' rel='noreferrer noopener'>
					Embedded Playground
				</a>
				{'|'}
			</p>
			<img src={require('../../assets/Icons/github.svg')} alt={gitHubIconAltName} />
			<p>
				{'Find our'}
				<a
					className='d-block'
					href='https://github.com/microsoft/PowerBI-Developer-Samples/'
					target='_blank'
					rel='noreferrer noopener'>
					sample code
				</a>
			</p>
		</div>
	);
}
