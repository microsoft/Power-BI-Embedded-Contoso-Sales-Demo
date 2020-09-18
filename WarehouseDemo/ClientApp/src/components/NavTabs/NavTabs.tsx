// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import './NavTabs.scss';
import React, { useContext } from 'react';
import ThemeContext from '../../themeContext';
import { Tab } from '../../models';

export interface NavTabsProps {
	tabsList: Array<Tab>;
	tabOnClick: { (selectedTab: Tab['name']): void };
}

export function NavTabs(props: NavTabsProps): JSX.Element {
	const theme = useContext(ThemeContext);

	return (
		<div className='d-flex m-left'>
			<ul className={`navbar-nav ${theme}`}>
				{props.tabsList.map((tab) => {
					return (
						<li key={tab.name} className='nav-item' onClick={() => props.tabOnClick(tab.name)}>
							<a
								className={`nav-link non-selectable pl-0 pr-0 ${
									tab.isActive ? 'active' : 'inactive'
								} ${theme}`}
								href='#'>
								{` ${tab.name} `}
							</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
