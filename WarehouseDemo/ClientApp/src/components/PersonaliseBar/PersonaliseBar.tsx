import './PersonaliseBar.scss';
import React from 'react';

interface PersonaliseBarProps {
	togglePersonaliseBar: { (): void };
}

export enum Layout {
	oneColumnLayout,
	twoColumnLayout,
	threeColumnLayout,
	twoColumnColspanLayout,
	twoColumnRowspanLayout,
}

export function PersonaliseBar(props: PersonaliseBarProps): JSX.Element {
	function toggleVisualDropdown() {
		// TODO: Add logic to show/hide dropdown
	}

	function toggleLayoutDropdown() {
		// TODO: Add logic to show/hide dropdown
	}

	const personaliseIcons = [
		{
			name: 'personalise-include-visuals',
			onClickHandler: toggleVisualDropdown,
			className: 'personalise-icon',
		},
		{
			name: 'personalise-layout',
			onClickHandler: toggleLayoutDropdown,
			className: 'personalise-icon',
		},
		{
			name: 'personalise-qna',
			onClickHandler: null,
			className: 'personalise-icon',
		},
	];

	const personaliseCloseIcon = {
		name: 'personalise-close',
		onClickHandler: props.togglePersonaliseBar,
		className: 'personalise-icon personalise-icon-close',
	};

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

	return personaliseBar;
}
