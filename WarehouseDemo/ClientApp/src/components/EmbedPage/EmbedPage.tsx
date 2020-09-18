// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

import './EmbedPage.scss';
import React, { useState, useEffect, useCallback } from 'react';
import { Report, Embed, models, service, IEmbedConfiguration } from 'powerbi-client';
import { PowerBIEmbed, EventHandler } from 'powerbi-client-react';
import { NavTabs } from '../NavTabs/NavTabs';
import { IconBar, IconBarProps } from '../IconBar/IconBar';
import { AnalyticsButton } from '../AnalyticsButton/AnalyticsButton';
import { PersonaliseBar } from '../PersonaliseBar/PersonaliseBar';
import ThemeContext from '../../themeContext';
import { Icon } from '../Icon/Icon';
import {
	getActivePage,
	getBookmarksFromReport,
	getSelectedBookmark,
	getStoredToken,
	checkTokenValidity,
	getPagesFromReport,
} from '../utils';
import { Footer } from '../Footer/Footer';
import { pairVisuals, getPageLayout, rearrangeVisualGroups } from '../VisualGroup';
import { Modal } from '../AnalyticsPopup/Modal/Modal';
import { Error } from '../ErrorPopup/Error';
import { BookmarksList } from '../BookmarksList/BookmarksList';
import { salesPersonTabs, salesManagerTabs, visualCommands, visualButtons } from '../../reportConfig';
import { AddLeadForm } from '../Forms/AddLeadForm';
import { EditLeadForm } from '../Forms/EditLeadForm';
import { UpdateOpportunityForm } from '../Forms/UpdateOpportunityForm';
import {
	storageKeyJWT,
	visualSelectorSchema,
	minutesToRefreshBeforeExpiration,
	FilterPaneWidth,
	ExtraEmbeddingMargin,
	AnonymousWritebackMessage,
	WritebackRefreshFailMessage,
	storageKeyTheme,
} from '../../constants';
import {
	EmbedParamsResponse,
	Bookmark,
	Tab,
	VisualGroup,
	Layout,
	TabName,
	Profile,
	Theme,
	ServiceAPI,
} from '../../models';
import $ from 'jquery';

export interface EmbedPageProps {
	profile: Profile;
	name: string;
	profileImageName: string;
	updateApp: IconBarProps['updateApp'];
}

export function EmbedPage(props: EmbedPageProps): JSX.Element {
	// State hook for error
	const [error, setError] = useState<string>('');

	const errorPopup = <Error error={error} setError={setError} />;

	// State hook for PowerBI Report
	const [powerbiReport, setReport] = useState<Report>(null);

	// State hook to toggle personalise bar
	const [theme, setTheme] = useState<Theme>(() => {
		// Check theme state to persist across sessions
		const storedThemeState = sessionStorage.getItem(storageKeyTheme);

		// Return stored theme if any theme state is stored and value exists in Theme enum values
		if (storedThemeState !== null && Object.values(Theme).includes(storedThemeState as Theme)) {
			return storedThemeState as Theme;
		}

		return Theme.Light;
	});

	// Report config state hook
	const [sampleReportConfig, setReportConfig] = useState<IEmbedConfiguration>({
		type: 'report',
		// Note: Empty string embedUrl is a temporary patch for powerbi-client bookmark bug
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
			extensions: [
				{
					command: {
						name: visualCommands.editLeads.name,
						title: visualCommands.editLeads.displayName,
						selector: {
							$schema: visualSelectorSchema,
							visualName: visualCommands.editLeads.visualGuid,
						},
						extend: {
							visualContextMenu: {
								menuLocation: models.MenuLocation.Top,
							},
						},
					},
				},
				{
					command: {
						name: visualCommands.editOpportunity.name,
						title: visualCommands.editOpportunity.displayName,
						selector: {
							$schema: visualSelectorSchema,
							visualName: visualCommands.editOpportunity.visualGuid,
						},
						extend: {
							visualContextMenu: {
								menuLocation: models.MenuLocation.Top,
							},
						},
					},
				},
			],
		},
		theme: {
			themeJson: require(`../../assets/ReportThemes/${theme}Theme.json`),
		},
	});

	// State hook to toggle personalise bar
	const [showPersonaliseBar, setShowPersonaliseBar] = useState<boolean>(false);

	// State hook to toggle add activity form
	const [editLeadFormPopup, setEditLeadFormPopup] = useState<boolean>(false);

	// State hook to toggle edit add lead form
	const [addLeadFormPopup, setAddLeadFormPopup] = useState<boolean>(false);

	// State hook to toggle edit opportunity form
	const [updateOpportunityFormPopup, setUpdateOpportunityFormPopup] = useState<boolean>(false);

	// State hook to capture values from the visuals
	const [visualAutofilledData, setVisualAutofilledData] = useState<object>(null);

	// State hook to set qna visual index
	const [qnaVisualIndex, setQnaVisualIndex] = useState<number>(null);

	// List of tabs' name
	let tabNames: Array<Tab['name']> = [];
	if (props.profile === Profile.SalesPerson) {
		tabNames = salesPersonTabs.map((tabConfig) => tabConfig.name);
	} else if (props.profile === Profile.SalesManager) {
		tabNames = salesManagerTabs.map((tabConfig) => tabConfig.name);
	}

	// State hook for active tab
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

	// State hook for the ratio of height/width of each respective page of the report
	const [pagesAspectRatio] = useState(new Map<string, number>());

	// State hook for report export progress
	const [isExportInProgress, setIsExportInProgress] = useState<boolean>(false);

	// State hook for write-back progress
	const [isWritebackInProgress, setWritebackProgressState] = useState<boolean>(false);

	// State hook for Analytics button background
	const [analyticsBtnActive, setAnalyticsBtnActive] = useState<string>('');

	/* End of state hooks declaration */

	// Report embedding event handlers
	const eventHandlersMap: Map<string, EventHandler> = new Map();

	eventHandlersMap.set('loaded', async function (event, embeddedReport: Report) {
		console.log('Report has loaded');

		// Get the page for the Home tab
		const pageName = getReportPageName(TabName.Home, props.profile);
		const page = embeddedReport.page(pageName);

		// Set the page active
		page?.setActive().catch((reason) => console.error(reason));

		// Get the report pages and update map of aspect ratios for all pages
		const reportPages = await getPagesFromReport(embeddedReport);
		reportPages.map((reportPage) => {
			pagesAspectRatio.set(
				reportPage.name,
				reportPage.defaultSize.height / reportPage.defaultSize.width
			);
		});

		const visuals = await page.getVisuals();
		// Pair the configured visuals
		const pairedVisual = pairVisuals(visuals);

		// Build visual groups and update state
		setReportVisuals(pairedVisual);

		// Check if the report has a QnA visual from the list of visuals and get the index
		let qnaVisualIndexSearch = pairedVisual.findIndex(
			(visual) => visual.mainVisual?.type === 'qnaVisual' || visual.overlapVisual?.type === 'qnaVisual'
		);

		// No QnA visual in the report
		if (qnaVisualIndexSearch === -1) {
			qnaVisualIndexSearch = null;
		}

		setQnaVisualIndex(qnaVisualIndexSearch);

		// Get bookmarks from the report and set the first bookmark as active
		getBookmarksFromReport(embeddedReport, (reportBookmarks) => {
			if (reportBookmarks.length > 0) {
				reportBookmarks[0].checked = true;
			}
			updateBookmarks(reportBookmarks);
		});

		// Render report
		embeddedReport.render();
	});

	eventHandlersMap.set('rendered', async function (event, embeddedReport: Report) {
		console.log('Report has rendered');
		// Add logic to trigger after report is rendered
		const activePage = await getActivePage(embeddedReport);
		const homePage = getReportPageName(TabName.Home, props.profile);

		// Return if the Home tab is active
		if (activePage.name === homePage) {
			return;
		}
		setPageHeight(activePage.name);
	});

	eventHandlersMap.set('commandTriggered', function (event) {
		console.log('Command triggered');

		if (typeof event.detail.dataPoints[0] !== 'undefined') {
			setVisualAutofilledData(event.detail.dataPoints[0].identity);
			if (event.detail.command === visualCommands.editLeads.name) {
				toggleEditLeadFormPopup();
			} else if (event.detail.command === visualCommands.editOpportunity.name) {
				toggleUpdateOpportunityFormPopup();
			}
		}
	});

	eventHandlersMap.set('buttonClicked', function (event): void {
		if (event.detail.id === visualButtons.addLeadButtonGuid) {
			// Restrict Anonymous User to toggle Add Activity form and Add New Lead form
			if (props.name === 'Anonymous') {
				setError(AnonymousWritebackMessage);
				return;
			}

			// Open add lead form
			toggleAddLeadFormPopup();
		}
	});

	eventHandlersMap.set('error', function (event: service.ICustomEvent<string>) {
		console.error(event.detail);
	});

	/**
	 * Refresh token when tokenExpiration has reached minutesToRefresh
	 * @param tokenExpiration time left to expire
	 * @param minutesBeforeExpiration time interval before expiration
	 */
	function setTokenExpirationListener(tokenExpiration: number, minutesBeforeExpiration: number): void {
		// Time in ms before expiration
		const msBeforeExpiration: number = minutesBeforeExpiration * 60 * 1000;

		// Current UTC time in ms
		const msCurrentTime: number = Date.now() + new Date().getTimezoneOffset() * 60 * 1000;

		// Time until token refresh in milliseconds
		const msToRefresh: number = tokenExpiration - msCurrentTime - msBeforeExpiration;

		// If token already expired, generate new token and set the access token
		if (msToRefresh <= 0) {
			fetchReportConfig();
		} else {
			setTimeout(fetchReportConfig, msToRefresh);
		}
	}

	// Fetch params for embed config for the report
	async function fetchReportConfig(): Promise<void> {
		// Get token from storage
		const storedToken = getStoredToken();

		// Check token expiry before making API request, redirect back to login page
		if (!checkTokenValidity(storedToken)) {
			alert('Session expired');

			// Re-render App component
			props.updateApp((prev: number) => prev + 1);
			return;
		}

		try {
			// Fetch report's embed params
			const serverRes = await fetch(ServiceAPI.FetchEmbedParams, {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${sessionStorage.getItem(storageKeyJWT)}`,
				},
			});

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

			// Get ms to expiration
			const msOfExpiration: number = Date.parse(embedParams.EmbedToken.Expiration);

			// Starting the expiration listener
			setTokenExpirationListener(msOfExpiration, minutesToRefreshBeforeExpiration);
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

	/**
	 * Gets the embedded report and updates the report state
	 * @param embeddedReport Embedded report instance
	 */
	function getReport(embeddedReport: Embed): void {
		const report = embeddedReport as Report;
		setReport(report);
	}

	/**
	 * Change theme of the app
	 * @param theme Theme to be applied
	 */
	async function switchTheme(theme: Theme): Promise<void> {
		if (!powerbiReport) {
			console.debug('Report object is null');
			return;
		}

		try {
			await powerbiReport.applyTheme({
				themeJson: require(`../../assets/ReportThemes/${theme}Theme.json`),
			});
			setTheme(theme);

			// Store theme state to persist across sessions
			sessionStorage.setItem(storageKeyTheme, theme);
		} catch (error) {
			console.error(error);
		}
	}

	// Apply the currently selected bookmark
	useEffect(() => {
		if (powerbiReport && bookmarks.length > 0 && activeTab === TabName.Analytics) {
			const selectedBookmark = getSelectedBookmark(bookmarks);

			if (selectedBookmark) {
				powerbiReport.bookmarksManager.applyState(selectedBookmark.state);
			}
		}
	}, [bookmarks, powerbiReport, activeTab]);

	function togglePersonaliseBar(): void {
		setShowPersonaliseBar((prevState) => !prevState);
	}

	function toggleExportProgressState() {
		setIsExportInProgress((prevState) => !prevState);
	}

	function toggleWritebackProgressState() {
		setWritebackProgressState((prevState) => !prevState);
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
		if (!powerbiReport) {
			console.debug('Report object is null');
			return;
		}

		// Get report page name corresponding to active tab
		const pageName = getReportPageName(activeTab, props.profile);

		// Set given page as active in the embedded report
		const page = powerbiReport.page(pageName);
		page?.setActive().catch((reason) => console.error(reason));

		// Remove the customLayout property from the Settings object
		setReportConfig((sampleReportConfig) => {
			return {
				...sampleReportConfig,
				settings: {
					panes: {
						filters: {
							visible: activeTab !== TabName.Home,
						},
						pageNavigation: {
							visible: false,
						},
					},
				},
			};
		});
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
			<Icon className='app-name' iconId={`app-name-${theme}`} width={111.5} height={40} />

			{navTabs}
			<IconBar
				name={props.name}
				profileImageName={props.profileImageName}
				profile={props.profile}
				showPersonaliseBar={activeTab === TabName.Home} // Show personalise bar when Home tab is active
				personaliseBarOnClick={togglePersonaliseBar}
				theme={theme}
				applyTheme={switchTheme}
				updateApp={props.updateApp}
			/>
		</nav>
	);

	/**
	 * Set the height based on width of the report-container and aspect-ratio of report page
	 * @param pageSection Report page whose height needs to be set in the container
	 */
	const setPageHeight = useCallback(
		(pageSection: string) => {
			const aspectRatio = pagesAspectRatio.get(pageSection);
			const currentWidth = $('.report-container').width();
			const newHeight = aspectRatio * (currentWidth - FilterPaneWidth - ExtraEmbeddingMargin);
			resetReportContainerHeight(newHeight);
		},
		[pagesAspectRatio]
	);

	/**
	 * Set the new height to the report-container
	 * @param height
	 */
	function resetReportContainerHeight(height: number) {
		$('.report-container').height(height);
	}

	/**
	 * Rearranges the visuals in the custom layout and updates the custom layout setting in report config state
	 */
	const rearrangeAndRenderCustomLayout = useCallback(async () => {
		// Reset the height of the report-container based on the width and ratio when activeTab is not Home
		if (activeTab !== TabName.Home) {
			const activePageSection = getReportPageName(activeTab, props.profile);
			setPageHeight(activePageSection);
			return;
		}

		// Rearrange the visuals as per the layout only if the activeTab is Home
		// Get active page and set the new calculated custom layout
		const activePage = await getActivePage(powerbiReport);

		// Calculate positions of visual groups
		const newReportHeight = rearrangeVisualGroups(reportVisuals, layoutType, powerbiReport);

		// Reset report-container height
		resetReportContainerHeight(newReportHeight);

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
							width: powerbiReport.element.clientWidth,
							height: newReportHeight,
						},
						displayOption: models.DisplayOption.ActualSize,
						pagesLayout: customPageLayout,
					},
				},
			};
		});
	}, [powerbiReport, layoutType, reportVisuals, activeTab, props.profile, setPageHeight]);

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

	// Hide Export Data, Edit Leads and Edit Opportunities option for Anonymous User
	useEffect(() => {
		if (props.name === 'Anonymous') {
			// Anonymous user shall not see Context Menu options (Edit Leads and Edit Opportunities)
			delete sampleReportConfig.settings.extensions;
		}
	}, [props.name, sampleReportConfig.settings]);

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
		<div className={`btn-analytics-container ${theme}`}>
			{
				<AnalyticsButton
					className={`${theme}`}
					dataToggle={'dropdown'}
					icon={`analytics-myviews-${theme}`}>
					My Views
				</AnalyticsButton>
			}
			{bookmarksList}
			{
				<AnalyticsButton
					className={`${analyticsBtnActive} ${theme}`}
					dataToggle={'modal'}
					dataTarget={'#modal-capture-view'}
					icon={`analytics-captureview-${theme}`}
					onClick={() => setAnalyticsBtnActive('btn-analytics-active')}>
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
			phasedEmbedding={true}
		/>
	);

	const captureViewPopup = (
		<Modal
			report={powerbiReport}
			captureBookmarkWithName={captureNewBookmark}
			isExportInProgress={isExportInProgress}
			setError={setError}
			toggleExportProgressState={toggleExportProgressState}
			selectedBookmark={getSelectedBookmark(bookmarks)}
			updateApp={props.updateApp}
			resetAnalyticsBtn={() => setAnalyticsBtnActive('')}
		/>
	);

	function toggleEditLeadFormPopup(): void {
		setEditLeadFormPopup((prevState) => !prevState);
	}

	function toggleUpdateOpportunityFormPopup(): void {
		setUpdateOpportunityFormPopup((prevState) => !prevState);
	}

	function toggleAddLeadFormPopup(): void {
		setAddLeadFormPopup((prevState) => !prevState);
	}

	function refreshReport(): void {
		powerbiReport.refresh().catch(() => {
			setError(WritebackRefreshFailMessage);
			// Trigger report refresh after 15 sec
			setTimeout(refreshReport, 15000);
		});
	}

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
			{editLeadFormPopup ? (
				<EditLeadForm
					preFilledValues={visualAutofilledData}
					toggleFormPopup={toggleEditLeadFormPopup}
					setError={setError}
					updateApp={props.updateApp}
					refreshReport={refreshReport}
					isWritebackInProgress={isWritebackInProgress}
					toggleWritebackProgressState={toggleWritebackProgressState}
				/>
			) : null}
			{addLeadFormPopup ? (
				<AddLeadForm
					toggleFormPopup={toggleAddLeadFormPopup}
					setError={setError}
					updateApp={props.updateApp}
					refreshReport={refreshReport}
					isWritebackInProgress={isWritebackInProgress}
					toggleWritebackProgressState={toggleWritebackProgressState}
				/>
			) : null}
			{updateOpportunityFormPopup ? (
				<UpdateOpportunityForm
					preFilledValues={visualAutofilledData}
					toggleFormPopup={toggleUpdateOpportunityFormPopup}
					setError={setError}
					updateApp={props.updateApp}
					refreshReport={refreshReport}
					isWritebackInProgress={isWritebackInProgress}
					toggleWritebackProgressState={toggleWritebackProgressState}
				/>
			) : null}
		</ThemeContext.Provider>
	);
}
