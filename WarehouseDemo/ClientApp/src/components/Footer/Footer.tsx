// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './Footer.scss';
import React, { useContext } from 'react';
import { FooterIcon } from '../Icon/FooterIcon';
import ThemeContext from '../../themeContext';

export function Footer(): JSX.Element {
	const theme = useContext(ThemeContext);

	return (
		<div className={`d-flex justify-content-center align-items-center non-selectable footer ${theme}`}>
			<p>
				This demo is powered by Power BI Embedded
				<label className='separator-pipe'>{'|'}</label>
			</p>

			<FooterIcon className='powerbi-icon' iconId='powerbi' height={22} width={30} />
			<p>
				{'Explore our'}
				<a className='d-block' href='https://aka.ms/pbijs/' target='_blank' rel='noreferrer noopener'>
					Embedded Playground
				</a>
				<label className='separator-pipe'>{'|'}</label>
			</p>

			<FooterIcon className='github-icon' iconId='github' height={22} width={22} />
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
