// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import './LoadingSpinner.scss';
import React, { useContext } from 'react';
import ThemeContext from '../../themeContext';

/**
 * Component to render loading spinner
 */
export function LoadingSpinner(): JSX.Element {
	const theme = useContext(ThemeContext);
	return (
		<div className='align-items-center d-flex justify-content-center spinner-form'>
			<div className={`spinner-border ${theme}`} role='status'>
				<span className='sr-only'>Loading...</span>
			</div>
		</div>
	);
}
