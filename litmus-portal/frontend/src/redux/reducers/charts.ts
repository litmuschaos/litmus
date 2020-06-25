import {
	ChartAction,
	ChartActions,
	ChartData,
	Experiment,
	ExperimentGroup,
} from "../../models";
import createReducer from "./createReducer";

const initialState: ChartData = {
	allExperimentGroups: [],
	displayExperimentGroups: [],
	totalExpCount: 0,
	chaosFilter: [],
	contributorFilter: [],
};

export const chartData = createReducer<ChartData>(initialState, {
	[ChartActions.LOAD_ALL_CHARTS](state: ChartData, action: ChartAction) {
		let totalExpCount: number = 0;
		let experimentGroups: ExperimentGroup[] = [];
		let chaosFilter: Set<string> = new Set<string>();
		let contributorFilter: Set<string> = new Set<string>();
		action.payload.forEach((g: any) => {
			let exp: Experiment[] = [];
			if (g.Experiments)
				g.Experiments.forEach((e: any) => {
					let spec = e.Spec;
					totalExpCount++;
					chaosFilter.add(e.Metadata.Annotations.Categories);
					exp.push({
						name: spec.DisplayName,
						metadataName: e.Metadata.Name,
						version: e.Metadata.Version,
						vendor: e.Metadata.Annotations.Vendor,
						category: e.Metadata.Annotations.Categories,
						createdAt: e.Metadata.Annotations.CreatedAt,
						supportLink: e.Metadata.Annotations.Support,
						description: spec.CategoryDescription,
						maturity: spec.Maturity,
						maintainers: spec.Maintainers
							? spec.Maintainers.map((m: any) => ({
									name: m.Name,
									email: m.Email,
							  }))
							: [],
						miniKubeVersion: spec.MiniKubeVersion,
						provider: spec.Provider.Name,
						links: spec.Links
							? spec.Links.map((l: any) => ({
									name: l.Name,
									url: l.Url,
							  }))
							: [],
						chaosExpCRDLink: spec.ChaosExpCRDLink,
						platforms: spec.Platforms,
						chaosType: spec.ChaosType,
					});
				});
			let spec = g.Spec;
			contributorFilter.add(spec.Provider.Name);
			experimentGroups.push({
				name: spec.DisplayName,
				metadataName: g.Metadata.Name,
				version: g.Metadata.Version,
				vendor: g.Metadata.Annotations.Vendor,
				createdAt: g.Metadata.Annotations.CreatedAt,
				supportLink: g.Metadata.Annotations.Support,
				categoryDescription: spec.CategoryDescription,
				description: g.Metadata.Annotations.ChartDescription,
				maintainers: spec.Maintainers
					? spec.Maintainers.map((m: any) => ({
							name: m.Name,
							email: m.Email,
					  }))
					: [],
				miniKubeVersion: spec.MiniKubeVersion,
				provider: spec.Provider.Name,
				links: spec.Links
					? spec.Links.map((l: any) => ({
							name: l.Name,
							url: l.Url,
					  }))
					: [],
				chaosExpCRDLink: spec.ChaosExpCRDLink,
				experiments: exp,
			});
		});
		return {
			...state,
			allExperimentGroups: experimentGroups,
			displayExperimentGroups: experimentGroups,
			totalExpCount: totalExpCount,
			chaosFilter: Array.from(chaosFilter),
			contributorFilter: Array.from(contributorFilter),
		};
	},
	[ChartActions.FILTER_CHARTS_BY_FILTERS](
		state: ChartData,
		action: ChartAction
	) {
		return {
			...state,
			displayExperimentGroups: action.payload,
		};
	},
	[ChartActions.SORT_CHARTS](state: ChartData, action: ChartAction) {
		return {
			...state,
			displayExperimentGroups: action.payload,
		};
	},
	[ChartActions.FILTER_CHARTS_ON_SEARCH](
		state: ChartData,
		action: ChartAction
	) {
		return {
			...state,
			displayExperimentGroups: action.payload,
		};
	},
});
