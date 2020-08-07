// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import React, { useContext } from 'react';
import './AnalyticsButton.scss';
import ThemeContext, { Theme } from '../../themeContext';

export interface AnalyticsButtonProps extends React.HTMLAttributes<HTMLDivElement> {
	icon: string; // svg image
	children?: string;
	dataToggle?: string;
	dataTarget?: string;
}

/**
 * Render buttons for Analytics tab
 * @param props AnalyticsButtonProps
 */
export function AnalyticsButton(props: AnalyticsButtonProps): JSX.Element {
	const theme: Theme = useContext(ThemeContext);

	return (
		<div
			id={props.id}
			className={`analytics-button ${props.className}`}
			data-toggle={props.dataToggle || null}
			data-target={props.dataTarget || null}
			onClick={props.onClick}>
			<img className='analytics-button-icon' src={props.icon}></img>
			<div className={`analytics-button-text ${theme}`}>{props.children}</div>
		</div>
	);
}
