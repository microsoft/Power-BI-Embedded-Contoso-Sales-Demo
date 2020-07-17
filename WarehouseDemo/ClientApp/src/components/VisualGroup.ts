// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import { VisualDescriptor, models, Report } from 'powerbi-client';
import { IVisualNode } from 'visualDescriptor';
import { Layout } from './PersonaliseBar/PersonaliseBar';
import {
	visualPairs,
	visualMargin,
	visualAspectRatio,
	rowsPerSpanTypeSection,
	visualsPerSpanTypeSection,
	overlapVisualHeightRatio,
} from '../constants';
import { layoutMap, LayoutColumns, SpanType } from './layoutMapping';

export interface VisualGroup {
	mainVisual: IVisualNode;
	overlapVisual?: IVisualNode;
	checked: boolean;
}

/**
 * Pairs the report visuals into VisualGroups based on visualPairs array
 * @param reportVisuals List of visuals of the embedded report
 */
export function pairVisuals(reportVisuals: VisualDescriptor[]): VisualGroup[] {
	// List of title of overlapping visuals
	const overlapVisualsPairList = visualPairs.map((visualPair) => {
		return visualPair[1];
	});

	// List of main visuals
	// Filter out overlapping visuals from all visuals, i.e. [reportVisuals] - [overlapping visuals]
	const mainVisualGroupList = reportVisuals.filter((reportVisual) => {
		return !overlapVisualsPairList.includes(reportVisual.title);
	});

	// Final list of Visual groups
	const visualGroups: VisualGroup[] = mainVisualGroupList.map((reportVisual) => {
		// Pair of groups visuals' title
		const visualTitlePair = visualPairs.find((visualPair) => {
			// Check if this main visual has a mapped overlapping visual
			return visualPair[0] === reportVisual.title;
		});

		let overlapVisual: VisualGroup['overlapVisual'];

		if (visualTitlePair) {
			// Title of the overlapping visual mapped to this reportVisual
			const overlapVisualTitle = visualTitlePair[1];

			// Get the overlap visual
			overlapVisual = reportVisuals.find((visual) => {
				return visual.title === overlapVisualTitle;
			});
		}

		return {
			mainVisual: reportVisual,
			overlapVisual: overlapVisual,

			// Make the QNA visual hidden by default
			checked: reportVisual.type !== 'qnaVisual',
		};
	});

	return visualGroups;
}

/**
 * Construct page Layout from selected visual groups
 * @param reportPageName
 * @param visualGroups Visual groups of the embedded report
 */
export function getPageLayout(reportPageName: string, visualGroups: VisualGroup[]): models.PagesLayout {
	const visualsLayout = visualGroupsToVisualsLayout(visualGroups);

	const pagesLayout: models.PagesLayout = {};
	pagesLayout[reportPageName] = {
		defaultLayout: {
			displayState: {
				// Default display mode for visuals is hidden
				mode: models.VisualContainerDisplayMode.Hidden,
			},
		},
		visualsLayout: visualsLayout,
	};

	return pagesLayout;
}

/**
 * Construct visual layout from selected visual groups
 * @param visualGroups Visual groups of the embedded report
 */
function visualGroupsToVisualsLayout(visualGroups: VisualGroup[]): models.VisualsLayout {
	const visualsLayout: models.VisualsLayout = {};

	for (const visualGroup of visualGroups) {
		// Show only the visuals groups selected
		if (!visualGroup.checked) {
			continue;
		}

		// Construct visual layout of mainVisual
		visualsLayout[visualGroup.mainVisual.name] = visualGroup.mainVisual.layout;

		// Construct visual layout of overlapping visual if available
		if (visualGroup.overlapVisual) {
			visualsLayout[visualGroup.overlapVisual.name] = visualGroup.overlapVisual.layout;
		}
	}

	// Convert every visual in all visual groups into type models.VisualsLayout
	return visualsLayout;
}

/**
 * Calculates the coordinates of all visuals for the given report
 * based on the layout type selected and updates the visualGroups array
 * @param visualGroups List of all visual groups of the report
 * @param selectedLayout Layout type selected
 * @param powerbiReport Embedded powerbi report
 * @returns new report's height
 */
export function rearrangeVisualGroups(
	visualGroups: VisualGroup[],
	selectedLayout: Layout,
	powerbiReport: Report
): number {
	const reportWidth = powerbiReport.element.clientWidth;
	let reportHeight = powerbiReport.element.clientHeight;

	// Get number of columns corresponding to given layout
	const layoutColumns = layoutMap.get(selectedLayout).columns;

	// Count of checked visuals
	const checkedVisualsLength = visualGroups.filter((visualGroup) => visualGroup.checked).length;

	// Calculating the combined width of the all visuals in a row
	const visualsTotalWidth = reportWidth - visualMargin * (layoutColumns + 1);

	// Calculate the width of a single visual, according to the number of columns
	// For one and three columns visuals width will be a third of visuals total width
	const visualWidth = visualsTotalWidth / layoutColumns;

	// Calculate visualHeight with margins
	let visualHeight = visualWidth * visualAspectRatio;

	// Get the layoutSpanType for given layout type
	const layoutSpanType = layoutMap.get(selectedLayout).spanType;

	// Visuals starting point
	let x = visualMargin;
	let y = visualMargin;

	// 2 x 2 Layout with column span in second row
	if (layoutSpanType === SpanType.ColSpan) {
		let rows = rowsPerSpanTypeSection * Math.floor(checkedVisualsLength / visualsPerSpanTypeSection);

		if (checkedVisualsLength % visualsPerSpanTypeSection) {
			rows += 1;
		}

		reportHeight = Math.max(reportHeight, rows * visualHeight + (rows + 1) * visualMargin);

		for (let idx = 0, checkedCount = 0; idx < visualGroups.length; idx++) {
			const element = visualGroups[idx];
			if (!element.checked) {
				continue;
			}

			// Width of this visual grp
			const width =
				checkedCount % visualsPerSpanTypeSection === visualsPerSpanTypeSection - 1
					? visualWidth * 2
					: visualWidth;

			const mainVisualLayout = element.mainVisual.layout;
			// Calc coordinates of main visual
			mainVisualLayout.x = x;
			mainVisualLayout.y = y;
			mainVisualLayout.width = width;
			mainVisualLayout.height = visualHeight;
			mainVisualLayout.displayState = {
				// Change the selected visual's display mode to visible
				mode: models.VisualContainerDisplayMode.Visible,
			};

			if (element.overlapVisual) {
				const overlapVisualLayout = element.overlapVisual.layout;
				// Calc coordinates of main visual
				overlapVisualLayout.x = x;
				overlapVisualLayout.y = y + visualHeight * (1 - overlapVisualHeightRatio);
				overlapVisualLayout.width = width;
				overlapVisualLayout.height = visualHeight * overlapVisualHeightRatio;
				overlapVisualLayout.displayState = {
					// Change the selected visual's display mode to visible
					mode: models.VisualContainerDisplayMode.Visible,
				};
			}

			// Calculating (x,y) position for the next visual
			x +=
				visualMargin +
				(checkedCount % visualsPerSpanTypeSection === visualsPerSpanTypeSection - 1
					? visualWidth * 2
					: visualWidth);

			// Reset x
			if (x + visualWidth > reportWidth) {
				x = visualMargin;
				y += visualHeight + visualMargin;
			}

			checkedCount++;
		}
	}
	// 2 x 2 Layout with row span in first column
	else if (layoutSpanType === SpanType.RowSpan) {
		let rows = rowsPerSpanTypeSection * Math.floor(checkedVisualsLength / visualsPerSpanTypeSection);

		if (checkedVisualsLength % visualsPerSpanTypeSection) {
			rows += 2;
		}

		reportHeight = Math.max(reportHeight, rows * visualHeight + (rows + 1) * visualMargin);

		for (let idx = 0, checkedCount = 0; idx < visualGroups.length; idx++) {
			const element = visualGroups[idx];
			if (!element.checked) {
				continue;
			}

			// Width of this visual grp
			const height = checkedCount % visualsPerSpanTypeSection === 0 ? visualHeight * 2 : visualHeight;

			const mainVisualLayout = element.mainVisual.layout;
			// Calc coordinates of main visual
			mainVisualLayout.x = x;
			mainVisualLayout.y = y;
			mainVisualLayout.width = visualWidth;
			mainVisualLayout.height = height;
			mainVisualLayout.displayState = {
				// Change the selected visual's display mode to visible
				mode: models.VisualContainerDisplayMode.Visible,
			};

			if (element.overlapVisual) {
				const overlapVisualLayout = element.overlapVisual.layout;
				// Calc coordinates of main visual
				overlapVisualLayout.x = x;
				overlapVisualLayout.y = y + height * (1 - overlapVisualHeightRatio);
				overlapVisualLayout.width = visualWidth;
				overlapVisualLayout.height = height * overlapVisualHeightRatio;
				overlapVisualLayout.displayState = {
					// Change the selected visual's display mode to visible
					mode: models.VisualContainerDisplayMode.Visible,
				};
			}

			// Calculating (x,y) position for the next visual
			x += visualMargin + visualWidth;

			// Reset x
			if (x + visualWidth > reportWidth) {
				x =
					(checkedCount + 1) % visualsPerSpanTypeSection === 0
						? visualMargin
						: 2 * visualMargin + visualWidth;
				y +=
					checkedCount % visualsPerSpanTypeSection === 0
						? visualHeight * 2
						: visualHeight + visualMargin;
			}

			checkedCount++;
		}
	}
	// n x n Layout
	else {
		if (layoutColumns === LayoutColumns.One) {
			visualHeight /= 2;
		}

		const rows = Math.ceil(checkedVisualsLength / layoutColumns);

		reportHeight = Math.max(reportHeight, rows * visualHeight + (rows + 1) * visualMargin);

		for (let idx = 0; idx < visualGroups.length; idx++) {
			const element = visualGroups[idx];
			if (!element.checked) {
				continue;
			}

			const mainVisualLayout = element.mainVisual.layout;
			// Calc coordinates of main visual
			mainVisualLayout.x = x;
			mainVisualLayout.y = y;
			mainVisualLayout.width = visualWidth;
			mainVisualLayout.height = visualHeight;
			mainVisualLayout.displayState = {
				// Change the selected visual's display mode to visible
				mode: models.VisualContainerDisplayMode.Visible,
			};

			if (element.overlapVisual) {
				const overlapVisualLayout = element.overlapVisual.layout;
				// Calc coordinates of main visual
				overlapVisualLayout.x = x;
				overlapVisualLayout.y = y + visualHeight * (1 - overlapVisualHeightRatio);
				overlapVisualLayout.width = visualWidth;
				overlapVisualLayout.height = visualHeight * overlapVisualHeightRatio;
				overlapVisualLayout.displayState = {
					// Change the selected visual's display mode to visible
					mode: models.VisualContainerDisplayMode.Visible,
				};
			}

			// Calculating (x,y) position for the next visual
			x += visualMargin + visualWidth;

			// Reset x
			if (x + visualWidth > reportWidth) {
				x = visualMargin;
				y += visualHeight + visualMargin;
			}
		}
	}

	// Return height to resize the embedded report
	return reportHeight;
}
