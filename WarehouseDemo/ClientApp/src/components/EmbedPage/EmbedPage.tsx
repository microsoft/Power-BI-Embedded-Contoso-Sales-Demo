// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './EmbedPage.scss';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Report, Embed, models, service, IEmbedConfiguration } from 'powerbi-client';
import { PowerBIEmbed } from 'powerbi-client-react';
import { Profile } from '../../App';
import { NavTabs, Tab } from '../NavTabs/NavTabs';
import { IconBar } from '../IconBar/IconBar';
import { AnalyticsButton } from '../AnalyticsButton/AnalyticsButton';
import { PersonaliseBar, Layout } from '../PersonaliseBar/PersonaliseBar';
import ThemeContext, { Theme } from '../../themeContext';
import { getVisualsFromPage, getActivePage, getBookmarksFromReport, getSelectedBookmark } from '../utils';
import { Footer } from '../Footer/Footer';
import { VisualGroup, pairVisuals, getPageLayout, rearrangeVisualGroups } from '../VisualGroup';
import { Modal } from '../AnalyticsPopup/Modal/Modal';
import { Error } from '../ErrorPopup/Error';
import { BookmarksList } from '../BookmarksList/BookmarksList';
import { salesPersonTabs, salesManagerTabs, TabName } from '../tabConfig';
import { appName, reportEmbedConfigUrl, ReportMargin, visibleClass, hiddenClass } from '../../constants';
import $ from 'jquery';

/**
 * Shape for the response from server end point constants.reportEmbedConfigUrl
 */
export interface EmbedParamsResponse {
	Id: string;
	EmbedUrl: string;
	Type: string;
	EmbedToken: {
		Token: string;
		TokenId: string;
		Expiration: string;
	};
	MinutesToExpiration: string;
	DefaultPage: string | null;
	MobileDefaultPage: string | null;
}

export interface EmbedPageProps {
	profile: Profile;
	firstName: string;
	lastName: string;
	profileImageName: string;
	logoutOnClick: { (): void };
}

export interface Bookmark extends models.IReportBookmark {
	checked?: boolean;
}

export function EmbedPage(props: EmbedPageProps): JSX.Element {
	// Cache DOM element
	const reportDiv = $('.report-container');

	// Hide the report-container on the initial load
	if (!reportDiv.hasClass(visibleClass)) {
		reportDiv.addClass(hiddenClass);
	}

	// State hook for error
	const [error, setError] = useState<string>('');

	const errorPopup = <Error error={error} setError={setError} />;

	// State hook for PowerBI Report
	const [powerbiReport, setReport] = useState<Report>(null);

	// Maintaining a ref to the 'powerbiReport' state hook
	// Reason: async callbacks like powerbi load event handler of PBI report does not
	// get the latest value of the state
	// https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
	// If a more elegant solution is found, update this approach of keeping state ref
	const stateRef = useRef<Report | null>();
	stateRef.current = powerbiReport;

	// State hook to toggle personalise bar
	const [theme, setTheme] = useState<Theme>(Theme.Light);

	// Report config state hook
	const [sampleReportConfig, setReportConfig] = useState<IEmbedConfiguration>({
		type: 'report',
		// TODO: Patch for powerbi-client bug
		embedUrl: '',
		tokenType: models.TokenType.Embed,
		accessToken: undefined,
		settings: {
			layoutType: models.LayoutType.Custom,
			customLayout: {
				displayOption: models.DisplayOption.FitToWidth,
				pagesLayout: {},
			},
			panes: {
				filters: {
					visible: false,
				},
				pageNavigation: {
					visible: false,
				},
			},
		},
		theme: {
			themeJson: require(`../../assets/ReportThemes/${theme}Theme.json`),
		},
	});

	// State hook to toggle personalise bar
	const [showPersonaliseBar, setShowPersonaliseBar] = useState<boolean>(false);

	// State hook to set qna visual index
	const [qnaVisualIndex, setQnaVisualIndex] = useState<number>(null);

	// List of tabs' name
	let tabNames: Array<Tab['name']> = [];
	if (props.profile === Profile.SalesPerson) {
		tabNames = salesPersonTabs.map((tabConfig) => tabConfig.name);
	} else if (props.profile === Profile.SalesManager) {
		tabNames = salesManagerTabs.map((tabConfig) => tabConfig.name);
	}

	// State hook to set first tab as active
	const [activeTab, setActiveTab] = useState<Tab['name']>(() => {
		if (tabNames?.length > 0) {
			return tabNames[0];
		} else {
			return null;
		}
	});

	// State hook for PowerBI Report
	const [reportVisuals, setReportVisuals] = useState<VisualGroup[]>([]);

	// State hook for the layout type to be rendered
	// Three column layout is the default layout type selected
	const [layoutType, setLayoutType] = useState<Layout>(Layout.threeColumnLayout);

	// State hook for the list of bookmarks of the report
	const [bookmarks, updateBookmarks] = useState<Bookmark[]>([]);

	/* End of state hooks declaration */

	const eventHandlersMap = new Map([
		[
			'loaded',
			function () {
				console.log('Report has loaded');

				// Get the page for the Home tab
				const pageName = getReportPageName(TabName.Home, props.profile);
				const page = stateRef.current.page(pageName);

				// Set the page active
				page?.setActive().catch((reason) => console.error(reason));

				getVisualsFromPage(page, (visuals) => {
					// Remove visuals without title
					visuals = visuals.filter((visual) => visual.title);

					// Check if the report has a QnA visual from the list of visuals and get the index
					let qnaVisualIndexSearch = visuals.findIndex((visual) => visual.type === 'qnaVisual');

					// No QnA visual in the report
					if (qnaVisualIndexSearch === -1) {
						qnaVisualIndexSearch = null;
					}

					setQnaVisualIndex(qnaVisualIndexSearch);

					// Build visual groups and update state
					setReportVisuals(pairVisuals(visuals));

					// Get bookmarks from the report
					getBookmarksFromReport(stateRef.current, updateBookmarks);
				});
			},
		],
		[
			'rendered',
			function () {
				// Cache DOM element
				const reportDiv = $('.report-container');

				// Show the report-container when the visuals are arranged
				reportDiv.removeClass(hiddenClass);
				reportDiv.addClass(visibleClass);

				console.log('Report has rendered');
				// Add logic to trigger after report is rendered
			},
		],
		[
			'error',
			function (event: service.ICustomEvent<string>) {
				console.error(event.detail);
			},
		],
	]);

	// Fetch params for embed config for the report
	async function fetchReportConfig(): Promise<void> {
		try {
			// Fetch report's embed params
			const serverRes = await fetch(reportEmbedConfigUrl, { method: 'POST' });

			if (!serverRes.ok) {
				// Show error popup if request fails
				setError(await serverRes.text());
				console.error(
					`Failed to fetch params for report. Status: ${serverRes.status} ${serverRes.statusText}`
				);
				return;
			}

			const serverResString = await serverRes.text();
			const embedParams: EmbedParamsResponse = await JSON.parse(serverResString);

			// Update the state "sampleReportConfig" and re-render component to embed report
			setReportConfig({
				...sampleReportConfig,
				embedUrl: embedParams.EmbedUrl,
				accessToken: embedParams.EmbedToken.Token,
			});
		} catch (error) {
			setError(error.message);
			console.error('Error in fetching embed configuration', error);
		}
	}

	// Fetch config when sampleReportConfig state does not contain accessToken
	// This effect runs only once at mount of this component
	useEffect(
		() => {
			if (!sampleReportConfig.accessToken) {
				fetchReportConfig();
			}
		},
		// Eslint does not allow the effect to run exactly once at the mount of component irrespective of hook dependencies
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	// Update title of the report iframe
	useEffect(() => {
		if (powerbiReport) {
			// Set iframe title
			powerbiReport.setComponentTitle('Report');
		}
	}, [powerbiReport]);

	function getReport(embeddedReport: Embed): void {
		const report = embeddedReport as Report;
		setReport(report);
	}

	// Change the theme of the embedded report
	useEffect(() => {
		if (powerbiReport) {
			powerbiReport
				.applyTheme({
					themeJson: require(`../../assets/ReportThemes/${theme}Theme.json`),
				})
				.then(function () {
					console.log('Theme applied in the report');
				});
		}
	}, [theme, powerbiReport]);

	// Apply the currently selected bookmark
	useEffect(() => {
		if (powerbiReport && bookmarks.length > 0) {
			const selectedBookmark = getSelectedBookmark(bookmarks);

			if (selectedBookmark) {
				powerbiReport.bookmarksManager.applyState(selectedBookmark.state);
			}
		}
	}, [bookmarks, powerbiReport]);

	// Change the theme of the embedded report
	useEffect(() => {
		if (powerbiReport) {
			powerbiReport
				.applyTheme({
					themeJson: require(`../../assets/ReportThemes/${
						theme === Theme.Light ? `lightTheme` : `darkTheme`
					}.json`),
				})
				.then(function () {
					console.log('Theme applied in the report');
				});
		}
	}, [theme, powerbiReport]);

	function togglePersonaliseBar(): void {
		setShowPersonaliseBar((prevState) => !prevState);
	}

	async function captureNewBookmark(capturedBookmarkName: string): Promise<void> {
		// Capture current state of report in a bookmark
		// Refer: https://github.com/microsoft/PowerBI-JavaScript/wiki/Bookmarks
		const capturedBookmark: Bookmark = await powerbiReport.bookmarksManager.capture();

		// default
		capturedBookmark.checked = true;

		// Update name of bookmark displayed in the list
		capturedBookmark.displayName = capturedBookmarkName;

		// Uncheck all other bookmarks
		const bookmarkList = bookmarks.map((bookmark) => {
			bookmark.checked = false;
			return bookmark;
		});

		// Update the bookmarks' list with current bookmarks as selected
		updateBookmarks([...bookmarkList, capturedBookmark]);
	}

	function tabOnClick(selectedTab: Tab['name']): void {
		// Close personalise bar when other tab is clicked
		if (selectedTab !== TabName.Home) {
			setShowPersonaliseBar(false);
		}
		setActiveTab(selectedTab);
	}

	function getReportPageName(activeTab: Tab['name'], profileType: Profile): string {
		let pageName: string;

		// Get report page name corresponding to active tab
		if (profileType === Profile.SalesPerson) {
			pageName = salesPersonTabs.find((salesPersonTab) => {
				return salesPersonTab.name === activeTab;
			})?.reportPageName;
		} else if (profileType === Profile.SalesManager) {
			pageName = salesManagerTabs.find((salesManagerTab) => {
				return salesManagerTab.name === activeTab;
			})?.reportPageName;
		} else {
			console.error('Unknown user name');
		}

		return pageName;
	}

	// Change embedded report's page based on new active tab
	useEffect(() => {
		// Get report page name corresponding to active tab
		const pageName = getReportPageName(activeTab, props.profile);

		if (powerbiReport) {
			// Set given page as active in the embedded report
			const page = powerbiReport.page(pageName);
			page?.setActive().catch((reason) => console.error(reason));

			// Remove the customLayout property fron the Settings object
			setReportConfig((sampleReportConfig) => {
				return {
					...sampleReportConfig,
					settings: {
						panes: {
							filters: {
								visible: false,
							},
							pageNavigation: {
								visible: false,
							},
						},
					},
				};
			});
		}
	}, [activeTab, powerbiReport, props.profile]);

	// Create array of Tab for rendering and set isActive as true for the active tab
	const tabsDetails: Array<Tab> = tabNames.map(
		(tabName: Tab['name']): Tab => {
			return { name: tabName, isActive: tabName === activeTab };
		}
	);

	const navTabs = <NavTabs tabsList={tabsDetails} tabOnClick={tabOnClick} />;

	const navPane = (
		<nav
			className={`header justify-content-between navbar navbar-expand-lg navbar-expand-md navbar-expand-sm navbar-light ${theme}`}>
			<img
				src={require(`../../assets/Images/app-name-${theme}.svg`)}
				className='app-name'
				alt={appName}
			/>
			{navTabs}
			<IconBar
				firstName={props.firstName}
				lastName={props.lastName}
				profileImageName={props.profileImageName}
				profile={props.profile}
				showPersonaliseBar={activeTab === TabName.Home} // Show personalise bar when Home tab is active
				personaliseBarOnClick={togglePersonaliseBar}
				logoutOnClick={props.logoutOnClick}
				theme={theme}
				applyTheme={setTheme}
			/>
		</nav>
	);

	/**
	 * Rearranges the visuals in the custom layout and updates the custom layout setting in report config state
	 */
	const rearrangeAndRenderCustomLayout = useCallback(() => {
		// Rearrange the visuals only if the activeTab is Home
		if (activeTab !== TabName.Home) return;

		// Get active page and set the new calculated custom layout
		getActivePage(powerbiReport).then((activePage) => {
			// Calculate positions of visual groups
			const newReportHeight = rearrangeVisualGroups(reportVisuals, layoutType, powerbiReport);

			// Get layout details for selected visuals in the custom layout
			// You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Custom-Layout
			const customPageLayout = getPageLayout(activePage.name, reportVisuals);

			// Update settings with new calculation of custom layout
			setReportConfig((sampleReportConfig) => {
				return {
					...sampleReportConfig,
					settings: {
						// Set page height automatically
						layoutType: models.LayoutType.Custom,
						customLayout: {
							pageSize: {
								type: models.PageSizeType.Custom,
								width: powerbiReport.element.clientWidth - ReportMargin,
								height: newReportHeight,
							},
							displayOption: models.DisplayOption.ActualSize,
							pagesLayout: customPageLayout,
						},
					},
				};
			});
		});
	}, [powerbiReport, layoutType, reportVisuals, activeTab]);

	// Attaches the rearrangeAndRenderCustomLayout function to resize event of window
	// Thus whenever window is resized, visuals will get arranged as per the dimensions of the resized report-container
	// For window.onresize the below function works as a normal function
	window.onresize = rearrangeAndRenderCustomLayout;

	// Update the layout of the embedded report
	useEffect(() => {
		if (!powerbiReport) {
			return;
		}
		rearrangeAndRenderCustomLayout();
	}, [powerbiReport, activeTab, rearrangeAndRenderCustomLayout]);

	/**
	 * Handle toggle of visual checkboxes
	 * @param event
	 */
	function handleCheckboxInput(event: React.ChangeEvent<HTMLInputElement>): void {
		const checkedValue = event.target.value;
		const checked = event.target.checked;

		if (reportVisuals.length === 0) {
			return;
		}

		setReportVisuals(
			reportVisuals.map((visual) => {
				// Visual show/hide is managed using visual's title, hence, only visuals with title are rendered
				// Update checkbox of visual group with title same as selected visual's title
				if (visual.mainVisual.title === checkedValue) {
					visual.checked = checked;
				}
				return visual;
			})
		);
	}

	// Handle toggle of QNA visual
	function toggleQnaVisual(): void {
		if (reportVisuals.length === 0) {
			return;
		}

		if (!qnaVisualIndex) {
			console.log('No Qna visual is present on this page of report');
			return;
		}

		// Deep copy of reportVisuals array (required for updating state)
		const reportVisualsQnaToggled = Array.from(reportVisuals);

		// Toggle visible state of the qna visual
		reportVisualsQnaToggled[qnaVisualIndex].checked = !reportVisualsQnaToggled[qnaVisualIndex].checked;

		setReportVisuals(reportVisualsQnaToggled);
	}

	const personaliseBar = (
		<PersonaliseBar
			visuals={reportVisuals}
			handleCheckboxInput={handleCheckboxInput}
			toggleQnaVisual={toggleQnaVisual}
			qnaVisualIndex={qnaVisualIndex}
			togglePersonaliseBar={togglePersonaliseBar}
			setLayoutType={setLayoutType}
			layoutType={layoutType}
		/>
	);

	const bookmarksList = <BookmarksList bookmarks={bookmarks} updateBookmarks={updateBookmarks} />;

	const analyticsButtonContainer = (
		<div className={`analytics-button-container ${theme}`}>
			{
				<AnalyticsButton
					className={`${theme}`}
					dataToggle={'dropdown'}
					icon={require(`../../assets/Icons/analytics-myviews-${theme}.svg`)}>
					My Views
				</AnalyticsButton>
			}
			{bookmarksList}
			{
				<AnalyticsButton
					className={`${theme}`}
					dataToggle={'modal'}
					dataTarget={'#modal-capture-view'}
					icon={require(`../../assets/Icons/analytics-captureview-${theme}.svg`)}>
					Capture View
				</AnalyticsButton>
			}

			<div className='horizontal-rule' />
		</div>
	);

	const reportContainer = (
		<PowerBIEmbed
			embedConfig={sampleReportConfig}
			getEmbeddedComponent={getReport}
			eventHandlers={eventHandlersMap}
			cssClassName={'report-container'}
		/>
	);

	const [isExportInProgress, setIsExportInProgress] = useState<boolean>(false);

	function toggleExportProgressState() {
		setIsExportInProgress((prevState) => !prevState);
	}

	const captureViewPopup = (
		<Modal
			report={powerbiReport}
			captureBookmarkWithName={captureNewBookmark}
			isExportInProgress={isExportInProgress}
			setError={setError}
			toggleExportProgressState={toggleExportProgressState}
			selectedBookmark={getSelectedBookmark(bookmarks)}
		/>
	);

	return (
		<ThemeContext.Provider value={theme}>
			<div className={`embed-page-class d-flex flex-column ${theme}`}>
				{navPane}
				{showPersonaliseBar && activeTab === TabName.Home ? personaliseBar : null}
				{activeTab === TabName.Analytics ? [analyticsButtonContainer, captureViewPopup] : null}
				{reportContainer}
				{errorPopup}
				<Footer />
			</div>
		</ThemeContext.Provider>
	);
}
