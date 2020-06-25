import { ChartActions, Experiment, ExperimentGroup } from "../../models";

let baseURL: string = "";
if (
	process.env.NODE_ENV.trim() === "development" ||
	process.env.NODE_ENV.trim() === "test"
) {
	baseURL = `${window.location.protocol}//${window.location.hostname}:8080`;
} else baseURL = "/api";

export const loadAllCharts = (version: string) => (
	dispatch: Function,
	getState: Function
) => {
	fetch(baseURL + `/charts/${version}`)
		.then((response) => response.json())
		.then((data) => {
			dispatch({
				type: ChartActions.LOAD_ALL_CHARTS,
				payload: data,
			});
		})
		.catch((err) => {
			console.error("Can't load data", err);
			dispatch({
				type: ChartActions.LOAD_ALL_CHARTS,
				payload: [],
			});
		});
};

export const filterCharts = (chaos: string, contributor: string) => (
	dispatch: Function,
	getState: Function
) => {
	const { chartData } = getState();
	let payload: ExperimentGroup[] = [];
	if (chaos === "All") {
		payload = chartData.allExperimentGroups;
	} else {
		payload = chartData.allExperimentGroups.filter(
			(expg: ExperimentGroup) =>
				expg.experiments.some(
					(exp: Experiment) => exp.category === chaos
				)
		);
	}
	if (contributor !== "All") {
		payload = payload.filter(
			(expg: ExperimentGroup) => expg.provider === contributor
		);
	}
	dispatch({
		type: ChartActions.FILTER_CHARTS_BY_FILTERS,
		payload: payload,
	});
};
export const sortCharts = () => (dispatch: Function, getState: Function) => {
	const { chartData } = getState();
	let payload: ExperimentGroup[] = [
		...chartData.displayExperimentGroups,
	].sort(
		(c1: ExperimentGroup, c2: ExperimentGroup) =>
			c1.experiments.length - c2.experiments.length
	);
	try {
		if (
			JSON.stringify(payload) ===
			JSON.stringify(chartData.displayExperimentGroups)
		)
			payload = [...chartData.displayExperimentGroups].sort(
				(c1: ExperimentGroup, c2: ExperimentGroup) =>
					c2.experiments.length - c1.experiments.length
			);
	} catch {
		console.error("Error Sorting Charts");
	}
	dispatch({
		type: ChartActions.SORT_CHARTS,
		payload: payload,
	});
};

export const searchCharts = (searchToken: string) => (
	dispatch: Function,
	getState: Function
) => {
	const { chartData } = getState();
	const tokens = searchToken
		.toLowerCase()
		.split(" ")
		.filter((s) => s !== "");
	const payload: ExperimentGroup[] = searchToken
		? chartData.allExperimentGroups.filter(
				(expg: ExperimentGroup) =>
					tokens.every((s: string) =>
						expg.name.toLowerCase().includes(s)
					) ||
					expg.experiments.some((exp: Experiment) =>
						tokens.every((s: string) =>
							exp.name.toLowerCase().includes(s)
						)
					)
		  )
		: chartData.allExperimentGroups;
	dispatch({
		type: ChartActions.FILTER_CHARTS_ON_SEARCH,
		payload: payload,
	});
};
