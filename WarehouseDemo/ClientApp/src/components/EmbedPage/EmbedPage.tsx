import './EmbedPage.scss';
import React, { useState, useEffect, useRef } from 'react';
import { Report, Embed, models, service } from 'powerbi-client';
import { PowerBIEmbed, EmbedProps } from 'powerbi-client-react';
import { Profile } from '../../App';
import { NavTabs, Tab } from '../NavTabs/NavTabs';
import { IconBar } from '../IconBar/IconBar';
import { PersonaliseBar } from '../PersonaliseBar/PersonaliseBar';
import { getVisualsFromReport } from '../utils';
import { Layout } from '../PersonaliseBar/PersonaliseBar';
import { salesPersonTabs, salesManagerTabs, TabName } from '../tabConfig';
import { appName, reportEmbedConfigUrl } from '../../constants';

export interface EmbedPageProps {
	profile: Profile;
	firstName: string;
	lastName: string;
	logoutOnClick: { (): void };
}

export interface ReportVisual {
	id: string;
	name: string;
	checked: boolean;
}

export function EmbedPage(props: EmbedPageProps): JSX.Element {
	// State hook for PowerBI Report
	const [powerbiReport, setReport] = useState<Report>(null);

	// Maintaining a ref to the 'powerbiReport' state hook
	// Reason: async callbacks like powerbi load event handler of PBI report does not
	// get the latest value of the state
	// https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
	// If a more elegant solution is found, update this approach of keeping state ref
	const stateRef = useRef<Report | null>();
	stateRef.current = powerbiReport;

	// Report config state hook
	const [sampleReportConfig, setReportConfig] = useState<
		EmbedProps['embedConfig']
	>({
		type: 'report',
		embedUrl: undefined,
		tokenType: models.TokenType.Embed,
		accessToken: undefined,
		settings: {
			layoutType: models.LayoutType.Custom,
			customLayout: {
				displayOption: models.DisplayOption.FitToWidth,
			},
		},
	});

	// State hook to toggle personalise bar
	const [showPersonaliseBar, setShowPersonaliseBar] = useState<boolean>(
		false
	);

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
	const [reportvisuals, setReportVisuals] = useState<ReportVisual[]>([]);

	/* End of state hooks declaration */

	const eventHandlersMap = new Map([
		[
			'loaded',
			function () {
				getVisualsFromReport(stateRef.current, (visuals) => {
					// Remove visuals without title
					visuals = visuals.filter(
						(visual) => visual.title !== undefined
					);

					// TODO: Get only valid visuals with title
					setReportVisuals(
						visuals.map((visual) => {
							return {
								id: visual.name,
								name: visual.title,
								checked: true,
							};
						})
					);
				});
			},
		],
		[
			'rendered',
			function () {
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

	// Fetch config for sample report
	async function fetchReportConfig(): Promise<void> {
		try {
			// Fetch report's embed config
			const serverRes = await fetch(reportEmbedConfigUrl);

			if (!serverRes.ok) {
				console.error(
					`Failed to fetch config for report. Status: ${serverRes.status} ${serverRes.statusText}`
				);
				return;
			}
			const serverResString = await serverRes.text();
			const { embedToken, embedUrl } = await JSON.parse(serverResString);

			// Update the state "sampleReportConfig" and re-render component to embed report
			setReportConfig({
				...sampleReportConfig,
				embedUrl: embedUrl,
				accessToken: embedToken,
			});
		} catch (error) {
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
			powerbiReport.setComponentTitle('Report');
		}
	}, [powerbiReport]);

	function getReport(embeddedReport: Embed): void {
		setReport(embeddedReport as Report);
	}

	function togglePersonaliseBar(): void {
		setShowPersonaliseBar((prevState) => !prevState);
	}

	function tabOnClick(selectedTab: Tab['name']): void {
		// Close personalise bar when other tab is clicked
		if (selectedTab !== TabName.Home) {
			setShowPersonaliseBar(false);
		}
		setActiveTab(selectedTab);
	}

	function getReportPageName(
		activeTab: Tab['name'],
		profileType: Profile
	): string {
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
		}
	}, [activeTab, powerbiReport, props.profile]);

	// State hook for the layout type to be rendered
	// Three column layout is the default layout type selected
	const [layoutType] = useState<Layout>(Layout.threeColumnLayout);

	// Create array of Tab for rendering and set isActive as true for the active tab
	const tabsDetails: Array<Tab> = tabNames.map(
		(tabName: Tab['name']): Tab => {
			return { name: tabName, isActive: tabName === activeTab };
		}
	);

	const navTabs = <NavTabs tabsList={tabsDetails} tabOnClick={tabOnClick} />;

	const navPane = (
		<nav className='justify-content-center navbar navbar-expand-lg navbar-expand-md navbar-expand-sm navbar-light'>
			<img
				className='app-name'
				src={require('../../assets/Images/app-name.svg')}
				alt={appName}
			/>
			{navTabs}
			<IconBar
				firstName={props.firstName}
				lastName={props.lastName}
				profile={props.profile}
				showPersonaliseBar={activeTab === TabName.Home} // Show personalise bar when Home tab is active
				personaliseBarOnClick={togglePersonaliseBar}
				logoutOnClick={props.logoutOnClick}
			/>
		</nav>
	);

	useEffect(() => {
		// TODO: Remove report visuals on checkbox here
		// Re-arrange visuals in the custom layout
	}, [reportvisuals, layoutType]);

	// TODO: add image styling
	const personaliseBar = (
		<PersonaliseBar togglePersonaliseBar={togglePersonaliseBar} />
	);

	const reportContainer = (
		<PowerBIEmbed
			embedConfig={sampleReportConfig}
			getEmbeddedComponent={getReport}
			eventHandlers={eventHandlersMap}
			cssClassName={'report-container'}
		/>
	);

	return (
		<div className='embed-page-class flex-row'>
			{navPane}
			{showPersonaliseBar && activeTab === TabName.Home
				? personaliseBar
				: null}
			{reportContainer}
		</div>
	);
}
