// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import './Footer.scss';
import React, { useContext } from 'react';
import ThemeContext from '../../themeContext';

export function Footer(): JSX.Element {
	const theme = useContext(ThemeContext);

	return (
		<div className={`d-flex justify-content-center align-items-center non-selectable footer ${theme}`}>
			<p>
				This demo is powered by Power BI Embedded
				<label className='separator-pipe'>{'|'}</label>
			</p>

			{/* Image url taken from Microsoft Power BI official Youtube channel, visit https://www.youtube.com/user/mspowerbi */}
			<img
				title='Power-BI'
				alt='Power-BI'
				className='footer-icon'
				src='https://yt3.ggpht.com/a/AATXAJy-o0POcD9iunn2z5MP34g_BZhnoMGlKcyzTD1TZQ=s100-c-k-c0xffffffff-no-rj-mo'></img>
			<p>
				{'Explore our'}
				<a className='d-block' href='https://aka.ms/pbijs/' target='_blank' rel='noreferrer noopener'>
					Embedded Playground
				</a>
				<label className='separator-pipe'>{'|'}</label>
			</p>

			{/* Image url taken from official page of GitHub logos, visit https://github.com/logos */}
			<img
				title='GitHub'
				alt='GitHub'
				className='footer-icon'
				src='https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'></img>
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
