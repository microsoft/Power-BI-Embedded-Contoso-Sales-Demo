// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import { VisualDescriptor, models, Report } from 'powerbi-client';
import {
	visualMargin,
	visualAspectRatio,
	visualsPerSpanTypeSection,
	overlapVisualHeightRatio,
	reportMargin,
} from '../constants';
import { layoutMap } from './layoutMapping';
import { VisualGroup, LayoutColumns, SpanType, Layout } from '../models';
import { visualPairs } from '../reportConfig';

/**
 * Pairs the report visuals into VisualGroups based on visualPairs array
 * @param reportVisuals List of visuals of the embedded report
 */
export function pairVisuals(reportVisuals: VisualDescriptor[]): VisualGroup[] {
	// List of guid of overlapping visuals
	const overlapVisualsPairList = visualPairs.map((visualPair) => {
		return visualPair[1];
	});

	// List of main visuals
	// Filter out overlapping visuals from all visuals, i.e. [reportVisuals] - [overlapping visuals]
	const mainVisualGroupList = reportVisuals.filter((reportVisual) => {
		return !overlapVisualsPairList.includes(reportVisual.name);
	});

	// Final list of Visual groups
	const visualGroups: VisualGroup[] = mainVisualGroupList.map((mainVisual) => {
		// Pair of groups visuals' guid
		const visualTitlePair = visualPairs.find((visualPair) => {
			// Check if this main visual has a mapped overlapping visual
			return visualPair[0] === mainVisual.name;
		});

		let overlapVisual: VisualGroup['overlapVisual'];

		if (visualTitlePair) {
			// guid of the overlapping visual mapped to this reportVisual
			const overlapVisualTitle = visualTitlePair[1];

			// Get the overlap visual
			overlapVisual = reportVisuals.find((visual) => {
				return visual.name === overlapVisualTitle;
			});
		}

		return {
			mainVisual: mainVisual,
			overlapVisual: overlapVisual,

			// Make the QNA visual hidden by default
			checked: mainVisual.type !== 'qnaVisual',
		};
	});

	// Move qna visual at the end
	const qnaVisualIndex = visualGroups.findIndex(
		(visualGroup) => visualGroup.mainVisual.type === 'qnaVisual'
	);
	if (qnaVisualIndex !== -1) {
		visualGroups.push(visualGroups.splice(qnaVisualIndex, 1)[0]);
	}

	// Move table visual at the end, after the qna visual
	const tableVisualIndex = visualGroups.findIndex(
		(visualGroup) => visualGroup.mainVisual.type === 'tableEx'
	);
	if (tableVisualIndex !== -1) {
		visualGroups.push(visualGroups.splice(tableVisualIndex, 1)[0]);
	}

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
	let reportHeight = 0;

	// Get number of columns corresponding to given layout
	const layoutColumns = layoutMap.get(selectedLayout).columns;

	// Calculating the combined width of the all visuals in a row
	const visualsTotalWidth = reportWidth - visualMargin * (layoutColumns - 1);

	// Calculating the combined width of the all visuals in a row
	const layoutWidth = reportWidth - 2 * reportMargin;

	// Calculate the width of a single visual, according to the number of columns
	// For one and three columns visuals width will be a third of visuals total width
	const visualWidth = visualsTotalWidth / layoutColumns;

	// Calculate visualHeight with margins
	let visualHeight = visualWidth * visualAspectRatio;

	// Get the layoutSpanType for given layout type
	const layoutSpanType = layoutMap.get(selectedLayout).spanType;

	// Visuals starting point
	let x = reportMargin;
	let y = reportMargin;

	// 2 x 2 Layout with column span in second row
	//  _ _
	// |_|_|
	// |___|
	if (layoutSpanType === SpanType.ColSpan) {
		for (let idx = 0, checkedCount = 0; idx < visualGroups.length; idx++) {
			const element = visualGroups[idx];

			// Do not render unchecked visuals
			if (!element.checked) {
				continue;
			}

			// Width of this visual grp
			let width =
				checkedCount % visualsPerSpanTypeSection === visualsPerSpanTypeSection - 1
					? visualWidth * 2 + visualMargin
					: visualWidth;

			// Height of this visual grp
			let height = visualHeight;

			// Adjust x, y, width, height, checkedCount for qna and table visual
			if (element.mainVisual.type === 'qnaVisual' || element.mainVisual.type === 'tableEx') {
				// Take full width
				width = layoutWidth;

				// Take the height from the report
				height = element.mainVisual.layout.height || visualHeight;

				x = reportMargin;

				if (checkedCount % visualsPerSpanTypeSection === 1) {
					y += visualHeight + visualMargin;
				}

				// Make checkedCount to be like last visual in this layout
				checkedCount += visualsPerSpanTypeSection - (checkedCount % visualsPerSpanTypeSection) - 1;
			}

			const mainVisualLayout = element.mainVisual.layout;
			// Calc coordinates of main visual
			mainVisualLayout.x = x;
			mainVisualLayout.y = y;
			mainVisualLayout.width = width;
			mainVisualLayout.height = height;
			mainVisualLayout.displayState = {
				// Change the selected visual's display mode to visible
				mode: models.VisualContainerDisplayMode.Visible,
			};

			// Update report height
			reportHeight = Math.max(reportHeight, mainVisualLayout.y + mainVisualLayout.height);

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

			// Reset x, y
			if (x + visualWidth > reportWidth) {
				x = reportMargin;
				y += height + visualMargin;
			}

			checkedCount++;
		}
	}
	// 2 x 2 Layout with row span in first column
	//  _ _
	// | |_|
	// |_|_|
	else if (layoutSpanType === SpanType.RowSpan) {
		for (let idx = 0, checkedCount = 0; idx < visualGroups.length; idx++) {
			const element = visualGroups[idx];

			// Do not render unchecked visuals
			if (!element.checked) {
				continue;
			}

			// Width of this visual grp
			let width = visualWidth;

			// Height of this visual grp
			let height =
				checkedCount % visualsPerSpanTypeSection === 0
					? visualHeight * 2 + visualMargin
					: visualHeight;

			// Adjust x, y, width, height, checkedCount for qna and table visual
			if (element.mainVisual.type === 'qnaVisual' || element.mainVisual.type === 'tableEx') {
				// Take full width
				width = layoutWidth;

				// Take the height from the report
				height = element.mainVisual.layout.height || visualHeight;

				x = reportMargin;

				switch (checkedCount % visualsPerSpanTypeSection) {
					case 1:
						y += visualHeight * 2 + visualMargin * 2;
						break;

					case 2:
						y += visualHeight + visualMargin;
						break;
				}

				// Render next visual as a first visual of layout
				checkedCount += visualsPerSpanTypeSection - (checkedCount % visualsPerSpanTypeSection) - 1;
			}

			const mainVisualLayout = element.mainVisual.layout;
			// Calc coordinates of main visual
			mainVisualLayout.x = x;
			mainVisualLayout.y = y;
			mainVisualLayout.width = width;
			mainVisualLayout.height = height;
			mainVisualLayout.displayState = {
				// Change the selected visual's display mode to visible
				mode: models.VisualContainerDisplayMode.Visible,
			};

			// Update report height
			reportHeight = Math.max(reportHeight, mainVisualLayout.y + mainVisualLayout.height);

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
			x += visualMargin + width;

			// Reset x, y
			if (x + visualWidth > reportWidth) {
				x =
					(checkedCount + 1) % visualsPerSpanTypeSection === 0
						? reportMargin
						: visualMargin + visualWidth;
				y +=
					checkedCount % visualsPerSpanTypeSection === 0 ? visualHeight * 2 : height + visualMargin;
			}

			checkedCount++;
		}
	}
	// n x n Layout
	else {
		if (layoutColumns === LayoutColumns.One) {
			visualHeight /= 2;
		}

		for (let idx = 0, checkedCount = 0; idx < visualGroups.length; idx++) {
			const element = visualGroups[idx];

			// Do not render unchecked visuals
			if (!element.checked) {
				continue;
			}

			// Width of this visual grp
			let width = visualWidth;

			// Height of this visual grp
			let height = visualHeight;

			// Adjust x, y, width, height, checkedCount for qna and table visual
			if (element.mainVisual.type === 'qnaVisual' || element.mainVisual.type === 'tableEx') {
				// Take full width
				width = layoutWidth;

				// Take the height from the report
				height = element.mainVisual.layout.height || visualHeight;

				x = reportMargin;

				// Start render from new row if it is not the start of the row
				if (checkedCount % layoutColumns !== 0) {
					y += visualHeight + visualMargin;
				}

				// Make checkedCount to be like last visual in this layout
				checkedCount += layoutColumns - (checkedCount % layoutColumns) - 1;
			}

			const mainVisualLayout = element.mainVisual.layout;
			// Calc coordinates of main visual
			mainVisualLayout.x = x;
			mainVisualLayout.y = y;
			mainVisualLayout.width = width;
			mainVisualLayout.height = height;
			mainVisualLayout.displayState = {
				// Change the selected visual's display mode to visible
				mode: models.VisualContainerDisplayMode.Visible,
			};

			// Update report height
			reportHeight = Math.max(reportHeight, mainVisualLayout.y + mainVisualLayout.height);

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
			x += visualMargin + width;

			// Reset x, y
			if (x + visualWidth > reportWidth) {
				x = reportMargin;
				y += height + visualMargin;
			}

			checkedCount++;
		}
	}

	// Return height to resize the embedded report
	return reportHeight + reportMargin;
}
