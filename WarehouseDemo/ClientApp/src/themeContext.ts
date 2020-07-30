// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import React from 'react';

export enum Theme {
	Light = 'light',
	Dark = 'dark',
}

const ThemeContext = React.createContext(Theme.Light);

export default ThemeContext;
