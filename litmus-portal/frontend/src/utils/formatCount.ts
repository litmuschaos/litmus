export const formatCount = (count: number | undefined): string => {
	if (count)
		return count >= 1000
			? (Math.floor(count / 100) / 10).toFixed(1) + "k+"
			: count + "";
	return "0";
};
