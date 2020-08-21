// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ---------------------------------------------------------------------------

import './EmbedPage.scss';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Report, Embed, models, service, IEmbedConfiguration } from 'powerbi-client';
import { PowerBIEmbed } from 'powerbi-client-react';
import { NavTabs } from '../NavTabs/NavTabs';
import type { EventHandler } from 'powerbi-client-react';
import { IconBar, IconBarProps } from '../IconBar/IconBar';
import { AnalyticsButton } from '../AnalyticsButton/AnalyticsButton';
import { PersonaliseBar } from '../PersonaliseBar/PersonaliseBar';
import ThemeContext from '../../themeContext';
import { Icon } from '../Icon/Icon';
import {
	getVisualsFromPage,
	getActivePage,
	getBookmarksFromReport,
	getSelectedBookmark,
	getStoredToken,
	checkTokenValidity,
} from '../utils';
import { Footer } from '../Footer/Footer';
import { pairVisuals, getPageLayout, rearrangeVisualGroups } from '../VisualGroup';
import { Modal } from '../AnalyticsPopup/Modal/Modal';
import { Error } from '../ErrorPopup/Error';
import { BookmarksList } from '../BookmarksList/BookmarksList';
import { salesPersonTabs, salesManagerTabs, visualCommands, visualButtons } from '../../reportConfig';
import { AddLeadForm } from '../Forms/AddLead';
import { AddActivityForm } from '../Forms/AddActivityForm';
import { EditLeadForm } from '../Forms/EditLeadForm';
import { UpdateOpportunityForm } from '../Forms/UpdateOpportunityForm';
import {
	storageKeyJWT,
	ReportMargin,
	visualSelectorSchema,
	minutesToRefreshBeforeExpiration,
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
	const [addActivityFormPopup, setAddActivityFormPopup] = useState<boolean>(false);

	// State hook to toggle add activity form
	const [editLeadFormPopup, setEditLeadFormPopup] = useState<boolean>(false);

	// State hook to toggle edit add lead form
	const [addLeadFormPopup, setAddLeadFormPopup] = useState<boolean>(false);

	// State hook to toggle edit opportunity form
	const [updateOpportunityFormPopup, setUpdateOpportunityFormPopup] = useState<boolean>(false);

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

	// State hook for report export progress
	const [isExportInProgress, setIsExportInProgress] = useState<boolean>(false);

	// State hook for Analytics button background
	const [analyticsBtnActive, setAnalyticsBtnActive] = useState<string>('');

	/* End of state hooks declaration */

	// Report embedding event handlers
	const eventHandlersMap: Map<string, EventHandler> = new Map([
		[
			'loaded',
			function (event, embeddedReport: Report): void {
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

				// Render report
				embeddedReport.render();
			},
		],
		[
			'rendered',
			function () {
				console.log('Report has rendered');
				// Add logic to trigger after report is rendered
			},
		],
		[
			'commandTriggered',
			function (event) {
				console.log('Command triggered');

				if (event.detail.command === visualCommands.editLeads.name) {
					toggleEditLeadFormPopup();
				} else if (event.detail.command === visualCommands.editOpportunity.name) {
					toggleUpdateOpportunityFormPopup();
				}
			},
		],
		[
			'buttonClicked',
			function (event) {
				console.log('Button Clicked');

				// Use id here if title is not unique
				if (event.detail.title === visualButtons.addLeadsTitle) {
					toggleAddLeadFormPopup();
				} else if (event.detail.title === visualButtons.addActivityTitle) {
					toggleAddActivityFormPopup();
				}
			},
		],
		[
			'error',
			function (event: service.ICustomEvent<string>) {
				console.error(event.detail);
			},
		],
	]);

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

	function togglePersonaliseBar(): void {
		setShowPersonaliseBar((prevState) => !prevState);
	}

	function toggleExportProgressState() {
		setIsExportInProgress((prevState) => !prevState);
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
			<Icon className='app-name' iconId={`app-name-${theme}`} width={111.5} height={40} />

			{navTabs}
			<IconBar
				name={props.name}
				profileImageName={props.profileImageName}
				profile={props.profile}
				showPersonaliseBar={activeTab === TabName.Home} // Show personalise bar when Home tab is active
				personaliseBarOnClick={togglePersonaliseBar}
				theme={theme}
				applyTheme={setTheme}
				updateApp={props.updateApp}
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

	function toggleAddActivityFormPopup(): void {
		setAddActivityFormPopup((prevState) => !prevState);
	}

	function toggleEditLeadFormPopup(): void {
		setEditLeadFormPopup((prevState) => !prevState);
	}

	function toggleUpdateOpportunityFormPopup(): void {
		setUpdateOpportunityFormPopup((prevState) => !prevState);
	}

	function toggleAddLeadFormPopup(): void {
		setAddLeadFormPopup((prevState) => !prevState);
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
			{addActivityFormPopup ? (
				<AddActivityForm toggleActivityFormPopup={toggleAddActivityFormPopup} />
			) : null}
			{editLeadFormPopup ? <EditLeadForm toggleEditLeadFormPopup={toggleEditLeadFormPopup} /> : null}
			{addLeadFormPopup ? <AddLeadForm toggleAddLeadFormPopup={toggleAddLeadFormPopup} /> : null}
			{updateOpportunityFormPopup ? (
				<UpdateOpportunityForm toggleUpdateOpportunityFormPopup={toggleUpdateOpportunityFormPopup} />
			) : null}
		</ThemeContext.Provider>
	);
}
