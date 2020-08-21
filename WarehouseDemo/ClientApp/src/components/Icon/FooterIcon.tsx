// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import React from 'react';
import { IconProps } from './Icon';

// Footer Icons need to be rendered along with the HTML
// Thus the file is not loaded as a separate file
// It gets rendered along the HTML by using SVG as component
import { ReactComponent as Sprite } from '../../assets/Icons/footer-sprite.svg';

/**
 * A component to render the footer images from the SVG sprite-sheet
 * @param props object for FooterIcon props
 */
export function FooterIcon(props: IconProps): JSX.Element {
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
			<Sprite />
			<title>{props.title}</title>
			<use xlinkHref={`#${props.iconId}`} />
		</svg>
	);
}
