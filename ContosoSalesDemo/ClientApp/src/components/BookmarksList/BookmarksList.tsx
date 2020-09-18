// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import './BookmarksList.scss';
import '../SettingsDropdown/SettingsDropdown.scss';
import React, { useContext } from 'react';
import { Bookmark } from '../../models';
import ThemeContext from '../../themeContext';
/**
 * Bookmarks list props
 */
export interface BookmarksListProps {
	bookmarks: Bookmark[];
	updateBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
	applyBookmarkOnClick?: {
		(bookmarkName: Bookmark['name']): void;
	};
}

/**
 * Renders bookmark list in the dropdown form
 */
export function BookmarksList(props: BookmarksListProps): JSX.Element {
	const theme = useContext(ThemeContext);

	/**
	 *
	 * @param selectedBookmarkName name of the bookmark to be selected
	 */
	function handleChange(selectedBookmarkName: string) {
		// Update checked for the selected bookmark
		props.updateBookmarks(
			props.bookmarks.map((bookmark) => {
				bookmark.checked = bookmark.name === selectedBookmarkName;
				return bookmark;
			})
		);
	}

	// List of bookmarks to be rendered
	const bookmarksList = props.bookmarks.map((bookmark, idx) => {
		return (
			<div
				className={`dropdown-item form-check bookmark-list-item ${theme}`}
				key={idx}
				onClick={() => handleChange(bookmark.name)}>
				<input
					type='radio'
					id={bookmark.name}
					name='bookmark-list-item'
					className='form-check-input'
					checked={bookmark.checked}
					value={bookmark.name}
					onChange={() => handleChange(bookmark.name)}
				/>
				<label className={`form-check-label label-radio ${theme}`} htmlFor={bookmark.name}></label>
				<span className='d-inline-block text-truncate' title={bookmark.displayName}>
					{bookmark.displayName}
				</span>
			</div>
		);
	});

	return <div className={`dropdown-menu bookmarks-dropdown-container ${theme}`}>{bookmarksList}</div>;
}
