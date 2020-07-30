import React, { useContext } from 'react';
import './AnalyticsButton.scss';
import ThemeContext, { Theme } from '../../themeContext';

export interface AnalyticsButtonProps {
	icon: string; // svg image
	onClick?: { (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void };
	children?: string;
}

/**
 * Render buttons for Analytics tab
 * @param props AnalyticsButtonProps
 */
export function AnalyticsButton(props: AnalyticsButtonProps): JSX.Element {
	const theme: Theme = useContext(ThemeContext);

	return (
		<div className={`analytics-button ${theme}`} onClick={props.onClick}>
			<img className='analytics-button-icon' src={props.icon}></img>
			<div className={`analytics-button-text ${theme}`}>{props.children}</div>
		</div>
	);
}
