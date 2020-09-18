// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import React from 'react';
import sprite from '../../assets/Icons/spritesheet.svg';

/**
 * Shape for the SVG Image to be rendered
 * Some props are inherited from React.SVGProps<SVGSVGElement>
 */
export interface IconProps extends React.SVGProps<SVGSVGElement> {
	iconId: string;
	title?: string;
	dataToggle?: string;
	dataTarget?: string;
	onClick?: { (): void };
}

/**
 * A component to render the image from the SVG sprite-sheet
 * @param props object for the SVG image props
 */
export function Icon(props: IconProps): JSX.Element {
	return (
		<svg
			viewBox={`0 0 ${props.width} ${props.height}`}
			id={props.id}
			data-toggle={props.dataToggle}
			data-target={props.dataTarget}
			height={props.height}
			width={props.width}
			className={props.className}
			key={props.key}
			onClick={props.onClick}>
			<title>{props.title}</title>
			<use xlinkHref={`${sprite}#${props.iconId}`} />
		</svg>
	);
}
