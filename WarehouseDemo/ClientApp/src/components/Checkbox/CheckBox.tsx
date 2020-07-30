// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import React, { useContext } from 'react';
import ThemeContext from '../../themeContext';

export interface CheckBoxProps {
	title: string;
	name: string;
	checked: boolean;
	handleCheckboxInput: { (event: React.ChangeEvent<HTMLInputElement>): void };
}

export const CheckBox = (props: CheckBoxProps): JSX.Element => {
	const theme = useContext(ThemeContext);

	return (
		<li className={`visual-checkbox-li ${theme}`}>
			<label>
				<span className={`visual-title ${theme}`}>{props.title}</span>
				<input
					id={props.name}
					onChange={props.handleCheckboxInput}
					type='checkbox'
					checked={props.checked}
					value={props.title}
				/>
				<span className='visual-checkbox-checkmark'></span>
			</label>
		</li>
	);
};
