import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { CheckBox } from '../src/components/CheckBox/CheckBox';
import { Footer } from '../src/components/Footer/Footer';

describe('App Test', function () {
	let container: HTMLDivElement | null;

	beforeAll(function () {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterAll(function () {
		document.body.removeChild(container);
		container = null;
	});

	it('render custom checkbox', function () {
		var isValidCheckBox = false;
		function handleCheckboxInput(
			event: React.ChangeEvent<HTMLInputElement>
		): void {
			isValidCheckBox = !isValidCheckBox;
		}
		act(() => {
			ReactDOM.render(<CheckBox
				title='checkBoxValue'
				name='checkBox'
				checked={isValidCheckBox}
				handleCheckboxInput={handleCheckboxInput}
			/>, container);
		});

		let checkBox: HTMLElement = document.getElementById('checkBox');
		checkBox.click();

		expect(isValidCheckBox).toBe(true);
	});

	it('render footer', function () {
		act(() => {
			ReactDOM.render(<Footer />, container);
		});

		let footer: HTMLCollection = document.getElementsByClassName('footer');

		expect(footer).toBeDefined();
		expect(footer.length).toBe(1);
	});
});