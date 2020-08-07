// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './PersonaliseBar.scss';
import '../EmbedPage/EmbedPage.scss';
import React, { useState, useEffect, useContext } from 'react';
import ThemeContext, { Theme } from '../../themeContext';
import { VisualGroup } from '../VisualGroup';
import { CheckBox } from '../Checkbox/CheckBox';

interface PersonaliseBarProps {
	togglePersonaliseBar: { (): void };
	visuals: VisualGroup[];
	handleCheckboxInput: { (event: React.ChangeEvent<HTMLInputElement>): void };
	toggleQnaVisual: { (): void };
	qnaVisualIndex: number;
	setLayoutType: { (layoutType: Layout): void };
	layoutType: Layout;
}

export enum Layout {
	oneColumnLayout,
	twoColumnLayout,
	threeColumnLayout,
	twoColumnColspanLayout,
	twoColumnRowspanLayout,
}

export function PersonaliseBar(props: PersonaliseBarProps): JSX.Element {
	// State hook to set a tab as active
	const [visualDropdown, setVisualDropdown] = useState<boolean>(false);

	// State hook to set a tab as active
	const [layoutDropdown, setLayoutDropdown] = useState<boolean>(false);

	const theme = useContext(ThemeContext);

	function toggleVisualDropdown() {
		setVisualDropdown((prevState) => !prevState);
		// TODO: Make closing of other dropdowns scalable
		setLayoutDropdown(false);
	}

	function toggleLayoutDropdown() {
		// TODO: Make closing of other dropdowns scalable
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
		// TODO: Remove report visuals on checkbox here
		// Re-arrange visuals in the custom layout
	}, [layoutDropdown]);

	let layoutImageName = 'three-column-selected';
	switch (props.layoutType) {
		case Layout.oneColumnLayout:
			layoutImageName = 'one-column-selected';
			break;

		case Layout.twoColumnLayout:
			layoutImageName = 'two-column-selected';
			break;

		case Layout.threeColumnLayout:
			layoutImageName = 'three-column-selected';
			break;

		case Layout.twoColumnRowspanLayout:
			layoutImageName = 'rowspan-selected';
			break;

		case Layout.twoColumnColspanLayout:
			layoutImageName = 'colspan-selected';
			break;
	}

	const showQnAcheck =
		props.qnaVisualIndex && props.visuals.length > 0 && props.visuals[props.qnaVisualIndex].checked;

	const personaliseIcons = [
		{
			name: `${
				visualDropdown ? 'personalise-include-visuals-light' : 'personalise-include-visuals-' + theme
			}`, //TODO - use template literal for false case
			onClickHandler: toggleVisualDropdown,
			className: `personalise-icon ${visualDropdown ? 'personalise-icon-active' : ''}`,
		},
		{
			name: `${
				layoutDropdown ? layoutImageName + '-light' : layoutImageName + '-personalise-' + theme
			}`, //TODO - use template literal
			onClickHandler: toggleLayoutDropdown,
			className: `personalise-icon ${layoutDropdown ? 'personalise-icon-active' : ''}`,
		},
		{
			name: `${
				showQnAcheck ? 'personalise-question-answer-light' : 'personalise-question-answer-' + theme
			}`, //TODO - use template literal
			onClickHandler: toggleQna,
			className: `personalise-icon ${showQnAcheck ? 'personalise-icon-active' : ''}`,
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
		},
		{
			name: 'two-column',
			selectedName: 'two-column-selected',
			dropdownName: `two-column-selected-${theme}`,
			layout: Layout.twoColumnLayout,
			className: 'layout-img',
		},
		{
			name: 'one-column',
			selectedName: 'one-column-selected',
			dropdownName: `one-column-selected-${theme}`,
			layout: Layout.oneColumnLayout,
			className: 'layout-img',
		},
		{
			name: 'rowspan',
			selectedName: 'rowspan-selected',
			dropdownName: `rowspan-selected-${theme}`,
			layout: Layout.twoColumnRowspanLayout,
			className: 'layout-img',
		},
		{
			name: 'colspan',
			selectedName: 'colspan-selected',
			dropdownName: `colspan-selected-${theme}`,
			layout: Layout.twoColumnColspanLayout,
			className: 'layout-img',
		},
	];

	const iconList = personaliseIcons.map((icon, idx) => {
		return (
			<img
				id={icon.name}
				src={require(`../../assets/Icons/${icon.name}.svg`)}
				alt={icon.name}
				className={icon.className}
				onClick={icon.onClickHandler}
				key={idx}
			/>
		);
	});

	const closeIcon = (
		<img
			id={personaliseCloseIcon.name}
			src={require(`../../assets/Icons/${personaliseCloseIcon.name}.svg`)}
			alt={personaliseCloseIcon.name}
			className={personaliseCloseIcon.className}
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
						<span
							className='layout-span d-flex justify-content-center'
							onClick={() => {
								props.setLayoutType(layoutType.layout);
							}}
							key={layoutType.name}>
							<img
								src={require(`../../assets/Icons/${imgName}.svg`)}
								alt={layoutType.name}
								className={layoutType.className}
								key={layoutType.name}
							/>
						</span>
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
