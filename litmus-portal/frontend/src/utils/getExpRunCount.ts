import { Experiment } from "../models";

export const getExpRunCount = (
	exp: Experiment | Experiment[],
	analyticsMap: Map<string, number>
) => {
	if (!Array.isArray(exp)) exp = [exp];
	return exp.reduce((total, exp) => {
		try {
			let expRun: number = analyticsMap.get(exp.metadataName) ?? 0;
			return total + expRun;
		} catch {
			return total;
		}
	}, 0);
};
