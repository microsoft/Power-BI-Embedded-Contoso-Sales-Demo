import './NavTabs.scss';
import React from 'react';

export interface Tab {
	readonly name: string;
	readonly isActive: boolean;
}

export interface NavTabsProps {
	tabsList: Array<Tab>;
	tabOnClick: { (selectedTab: Tab['name']): void };
}

export function NavTabs(props: NavTabsProps): JSX.Element {
	return (
		<ul className='navbar-nav'>
			{props.tabsList.map((tab) => {
				return (
					<li
						key={tab.name}
						className={'nav-item ' + (tab.isActive ? 'active' : '')}
						onClick={() => props.tabOnClick(tab.name)}>
						<a className='nav-link pl-0 pr-0' href='#'>
							{tab.name}
						</a>
					</li>
				);
			})}
		</ul>
	);
}
