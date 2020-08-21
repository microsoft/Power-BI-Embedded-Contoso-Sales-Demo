// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './AnalyticsButton.scss';
import React, { useContext } from 'react';
import { Icon } from '../Icon/Icon';
import ThemeContext from '../../themeContext';
import { Theme } from '../../models';

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
	const buttonDimension = 15;
	return (
		<div
			id={props.id}
			className={`btn-analytics ${props.className}`}
			data-toggle={props.dataToggle || null}
			data-target={props.dataTarget || null}
			onClick={props.onClick}>
			<Icon
				className='btn-analytics-icon'
				iconId={props.icon}
				height={buttonDimension}
				width={buttonDimension}
			/>
			<div className={`btn-analytics-text non-selectable ${theme}`}>{props.children}</div>
		</div>
	);
}
