// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import React from 'react';

export interface CheckBoxProps {
	title: string;
	name: string;
	checked: boolean;
	handleCheckboxInput: { (event: React.ChangeEvent<HTMLInputElement>): void };
}

export const CheckBox = (props: CheckBoxProps): JSX.Element => {
	return (
		<li className='visual-checkbox-li'>
			<label>
				<span className='visual-title'>{props.title}</span>
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
