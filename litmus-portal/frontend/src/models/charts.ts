export interface Maintainer {
	name: string;
	email: string;
}
export interface Link {
	name: string;
	url: string;
}
export interface Experiment {
	name: string;
	metadataName: string;
	version: string;
	vendor?: string;
	category?: string;
	createdAt?: string;
	supportLink?: string;
	description: string;
	maturity: string;
	maintainers: Maintainer[];
	miniKubeVersion?: string;
	provider: string;
	links: Link[];
	chaosExpCRDLink: string;
	platforms: string[];
	chaosType?: string;
}
export interface ExperimentGroup {
	name: string;
	metadataName: string;
	version: string;
	vendor?: string;
	createdAt?: string;
	supportLink?: string;
	description: string;
	categoryDescription: string;
	maintainers: Maintainer[];
	miniKubeVersion?: string;
	provider: string;
	links: Link[];
	experiments: Experiment[];
	chaosExpCRDLink: string;
}

export interface ChartData {
	allExperimentGroups: ExperimentGroup[];
	displayExperimentGroups: ExperimentGroup[];
	totalExpCount: number;
	chaosFilter: string[];
	contributorFilter: string[];
}

export enum ChartActions {
	LOAD_ALL_CHARTS = "LOAD_ALL_CHARTS",
	// LOAD_CHART = "LOAD_CHART",
	FILTER_CHARTS_ON_SEARCH = "FILTER_CHARTS_ON_SEARCH",
	FILTER_CHARTS_BY_FILTERS = "FILTER_CHARTS_BY_FILTERS",
	SORT_CHARTS = "SORT_CHARTS",
}

interface ChartActionType<T, P> {
	type: T;
	payload: P;
}

export type ChartAction =
	| ChartActionType<typeof ChartActions.LOAD_ALL_CHARTS, ExperimentGroup[]>
	// | ChartActionType<typeof ChartActions.LOAD_CHART, Experiment>
	| ChartActionType<
			typeof ChartActions.FILTER_CHARTS_ON_SEARCH,
			ExperimentGroup[]
	  >
	| ChartActionType<
			typeof ChartActions.FILTER_CHARTS_BY_FILTERS,
			ExperimentGroup[]
	  >
	| ChartActionType<typeof ChartActions.SORT_CHARTS, ExperimentGroup[]>;
