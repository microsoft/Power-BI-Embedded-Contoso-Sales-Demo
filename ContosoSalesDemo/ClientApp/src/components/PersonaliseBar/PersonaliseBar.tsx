// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import './PersonaliseBar.scss';
import '../EmbedPage/EmbedPage.scss';
import React, { useState, useEffect, useContext } from 'react';
import ThemeContext from '../../themeContext';
import { Icon } from '../Icon/Icon';
import { CheckBox } from '../Checkbox/CheckBox';
import { VisualGroup, Layout, Theme } from '../../models';

interface PersonaliseBarProps {
	togglePersonaliseBar: { (): void };
	visuals: VisualGroup[];
	handleCheckboxInput: { (event: React.ChangeEvent<HTMLInputElement>): void };
	toggleQnaVisual: { (): void };
	qnaVisualIndex: number;
	setLayoutType: { (layoutType: Layout): void };
	layoutType: Layout;
}

export function PersonaliseBar(props: PersonaliseBarProps): JSX.Element {
	// State hook to set a tab as active
	const [visualDropdown, setVisualDropdown] = useState<boolean>(false);

	// State hook to set a tab as active
	const [layoutDropdown, setLayoutDropdown] = useState<boolean>(false);

	const theme = useContext(ThemeContext);

	function toggleVisualDropdown() {
		setVisualDropdown((prevState) => !prevState);
		setLayoutDropdown(false);
	}

	function toggleLayoutDropdown() {
		setVisualDropdown(false);
		setLayoutDropdown((prevState) => !prevState);
	}

	// This function will be used to close the layouts and visuals dropdown and also toggle the QnaVisual
	function toggleQna() {
		// Close the layout dropdown
		setLayoutDropdown(false);

		// Close the visuals dropdown
		setVisualDropdown(false);

		props.toggleQnaVisual();
	}

	useEffect(() => {
		// Re-arrange visuals in the custom layout
	}, [layoutDropdown]);

	let layoutImageName = 'three-column-selected';
	let layoutIconWidth = 25;
	let layoutIconHeight = 25;
	switch (props.layoutType) {
		case Layout.oneColumnLayout:
			layoutImageName = 'one-column-selected';
			layoutIconWidth = 7;
			layoutIconHeight = 25;
			break;

		case Layout.twoColumnLayout:
			layoutImageName = 'two-column-selected';
			layoutIconWidth = 16;
			layoutIconHeight = 25;
			break;

		case Layout.threeColumnLayout:
			layoutImageName = 'three-column-selected';
			layoutIconWidth = 25;
			layoutIconHeight = 25;
			break;

		case Layout.twoColumnRowspanLayout:
			layoutImageName = 'rowspan-selected';
			layoutIconWidth = 21;
			layoutIconHeight = 16;
			break;

		case Layout.twoColumnColspanLayout:
			layoutImageName = 'colspan-selected';
			layoutIconWidth = 16;
			layoutIconHeight = 21;
			break;
	}

	const showQnAcheck =
		props.qnaVisualIndex && props.visuals.length > 0 && props.visuals[props.qnaVisualIndex].checked;

	const personaliseIcons = [
		{
			name: `${
				visualDropdown ? 'personalise-include-visuals-light' : 'personalise-include-visuals-' + theme
			}`,
			onClickHandler: toggleVisualDropdown,
			className: `personalise-icon ${visualDropdown ? 'personalise-icon-active' : ''}`,
			width: 29,
			height: 19,
		},
		{
			name: `${
				layoutDropdown ? layoutImageName + '-light' : layoutImageName + '-personalise-' + theme
			}`,
			onClickHandler: toggleLayoutDropdown,
			className: `personalise-icon ${layoutDropdown ? 'personalise-icon-active' : ''}`,
			width: layoutIconWidth,
			height: layoutIconHeight,
		},
		{
			name: `${
				showQnAcheck ? 'personalise-question-answer-light' : 'personalise-question-answer-' + theme
			}`,
			onClickHandler: toggleQna,
			className: `personalise-icon ${showQnAcheck ? 'personalise-icon-active' : ''}`,
			width: 25,
			height: 25,
		},
	];

	const personaliseCloseIcon = {
		name: `personalise-close-${theme}`,
		onClickHandler: props.togglePersonaliseBar,
		className: 'personalise-icon personalise-icon-close',
	};

	const layoutTypes = [
		{
			name: 'three-column',
			selectedName: 'three-column-selected',
			dropdownName: `three-column-selected-${theme}`,
			layout: Layout.threeColumnLayout,
			className: 'layout-img',
			width: 25,
			height: 25,
		},
		{
			name: 'two-column',
			selectedName: 'two-column-selected',
			dropdownName: `two-column-selected-${theme}`,
			layout: Layout.twoColumnLayout,
			className: 'layout-img',
			width: 16,
			height: 25,
		},
		{
			name: 'one-column',
			selectedName: 'one-column-selected',
			dropdownName: `one-column-selected-${theme}`,
			layout: Layout.oneColumnLayout,
			className: 'layout-img',
			width: 7,
			height: 25,
		},
		{
			name: 'rowspan',
			selectedName: 'rowspan-selected',
			dropdownName: `rowspan-selected-${theme}`,
			layout: Layout.twoColumnRowspanLayout,
			className: 'layout-img',
			width: 21,
			height: 16,
		},
		{
			name: 'colspan',
			selectedName: 'colspan-selected',
			dropdownName: `colspan-selected-${theme}`,
			layout: Layout.twoColumnColspanLayout,
			className: 'layout-img',
			width: 16,
			height: 21,
		},
	];

	const iconList = personaliseIcons.map((icon, idx) => {
		return (
			<Icon
				id={icon.name}
				className={icon.className}
				iconId={icon.name}
				height={icon.height}
				width={icon.width}
				key={idx}
				onClick={icon.onClickHandler}
			/>
		);
	});

	const closeIcon = (
		<Icon
			id={personaliseCloseIcon.name}
			className={personaliseCloseIcon.className}
			iconId={personaliseCloseIcon.name}
			height={17}
			width={17}
			onClick={personaliseCloseIcon.onClickHandler}
		/>
	);

	const personaliseBar = (
		<div className={`personalise-bar ${theme}`}>
			<div>{iconList}</div>
			<div>{closeIcon}</div>
		</div>
	);

	const visualListTitle = <div className={`visual-list-title ${theme}`}>{' Configure Report View '}</div>;
	const visualListSubtitle = <div className={`visual-list-subtitle ${theme}`}> (Show/Hide) </div>;

	let visualsCheckboxList: JSX.Element[] = null;

	if (props.visuals?.length > 0) {
		visualsCheckboxList = props.visuals
			.filter((visual) => visual.mainVisual.type !== 'qnaVisual')
			.map((visual, idx) => {
				return (
					<CheckBox
						title={visual.mainVisual.title}
						name={visual.mainVisual.name}
						checked={visual.checked}
						handleCheckboxInput={props.handleCheckboxInput}
						key={idx}
					/>
				);
			});
	}

	// Visuals dropdown element
	const visualsCheckbox: JSX.Element = visualDropdown ? (
		<div className='dropdown'>
			<ul className={`dropdown-menu checkbox-menu allow-focus show visuals-list-dropdown ${theme}`}>
				{visualListTitle}
				{visualListSubtitle}
				{visualsCheckboxList}
			</ul>
		</div>
	) : null;

	// Layouts dropdown element
	const layoutsElement: JSX.Element = layoutDropdown ? (
		<div className='dropdown'>
			<ul className={`dropdown-menu checkbox-menu allow-focus layouts-list-dropdown ${theme}`}>
				{layoutTypes.map((layoutType) => {
					let imgName: string;
					if (props.layoutType === layoutType.layout) {
						imgName = theme === Theme.Light ? layoutType.selectedName : layoutType.dropdownName;
					} else {
						imgName = layoutType.name;
					}
					return (
						<Icon
							className={layoutType.className}
							iconId={imgName}
							width={layoutType.width}
							height={layoutType.height}
							key={layoutType.name}
							onClick={() => {
								props.setLayoutType(layoutType.layout);
							}}
						/>
					);
				})}
			</ul>
		</div>
	) : null;

	return (
		<React.Fragment>
			{personaliseBar}
			{visualsCheckbox}
			{layoutsElement}
		</React.Fragment>
	);
}
