// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './PersonaliseBar.scss';
import '../EmbedPage/EmbedPage.scss';
import React, { useState, useEffect } from 'react';
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

	const personaliseIcons = [
		{
			name: 'personalise-include-visuals',
			onClickHandler: toggleVisualDropdown,
			className: `personalise-icon ${visualDropdown ? 'personalise-icon-active' : ''}`,
		},
		{
			name: layoutImageName,
			onClickHandler: toggleLayoutDropdown,
			className: `personalise-icon ${layoutDropdown ? 'personalise-icon-active' : ''}`,
		},
		{
			name: 'personalise-qna',
			onClickHandler: props.toggleQnaVisual,
			className: `personalise-icon ${
				props.qnaVisualIndex &&
				props.visuals.length > 0 &&
				props.visuals[props.qnaVisualIndex].checked
					? 'personalise-icon-active'
					: ''
			}`,
		},
	];

	const personaliseCloseIcon = {
		name: 'personalise-close',
		onClickHandler: props.togglePersonaliseBar,
		className: 'personalise-icon personalise-icon-close',
	};

	const layoutTypes = [
		{
			name: 'three-column',
			selectedName: 'three-column-selected',
			layout: Layout.threeColumnLayout,
			className: 'layout-img',
		},
		{
			name: 'two-column',
			selectedName: 'two-column-selected',
			layout: Layout.twoColumnLayout,
			className: 'layout-img',
		},
		{
			name: 'one-column',
			selectedName: 'one-column-selected',
			layout: Layout.oneColumnLayout,
			className: 'layout-img',
		},
		{
			name: 'rowspan',
			selectedName: 'rowspan-selected',
			layout: Layout.twoColumnRowspanLayout,
			className: 'layout-img',
		},
		{
			name: 'colspan',
			selectedName: 'colspan-selected',
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
		<div className='personalise-bar'>
			<div>{iconList}</div>
			<div>{closeIcon}</div>
		</div>
	);

	const visualListTitle = <div className='visual-list-title'> Configure Report View </div>;
	const visualListSubtitle = <div className='visual-list-subtitle'> (Show/Hide) </div>;

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
			<ul className='dropdown-menu checkbox-menu allow-focus show visuals-list-dropdown'>
				{visualListTitle}
				{visualListSubtitle}
				{visualsCheckboxList}
			</ul>
		</div>
	) : null;

	// Layouts dropdown element
	const layoutsElement: JSX.Element = layoutDropdown ? (
		<div className='dropdown'>
			<ul className='dropdown-menu checkbox-menu allow-focus layouts-list-dropdown'>
				{layoutTypes.map((layoutType, idx) => {
					let imgName = undefined;
					if (props.layoutType === layoutType.layout) {
						imgName = layoutType.selectedName;
					} else {
						imgName = layoutType.name;
					}
					return (
						<img
							src={require(`../../assets/Icons/${imgName}.svg`)}
							alt={layoutType.name}
							className={layoutType.className}
							onClick={() => {
								props.setLayoutType(layoutType.layout);
							}}
							key={idx}
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
