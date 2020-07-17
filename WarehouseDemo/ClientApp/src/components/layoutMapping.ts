// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import { Layout } from './PersonaliseBar/PersonaliseBar';

export interface LayoutMapping {
	spanType: SpanType;
	columns: number;
}

export enum SpanType {
	None = 0,
	RowSpan = 1,
	ColSpan = 2,
}

export enum LayoutColumns {
	One = 1,
	Two = 2,
	Three = 3,
}

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
