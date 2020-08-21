// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import { Layout, LayoutMapping, SpanType } from '../models';

export const layoutMap = new Map<Layout, LayoutMapping>([
	[
		Layout.oneColumnLayout,
		{
			spanType: SpanType.None,
			columns: 1,
		},
	],
	[
		Layout.twoColumnLayout,
		{
			spanType: SpanType.None,
			columns: 2,
		},
	],
	[
		Layout.threeColumnLayout,
		{
			spanType: SpanType.None,
			columns: 3,
		},
	],
	[
		Layout.twoColumnColspanLayout,
		{
			spanType: SpanType.ColSpan,
			columns: 2,
		},
	],
	[
		Layout.twoColumnRowspanLayout,
		{
			spanType: SpanType.RowSpan,
			columns: 2,
		},
	],
]);
