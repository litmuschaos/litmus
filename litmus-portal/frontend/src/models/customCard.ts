import React from "react";

export interface CardProps {
	id: string;
	title: string;
	urlToIcon?: string;
	handleClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	experimentCount?: number;
	provider: string;
	description?: string;
	totalRuns?: number;
	chaosType?: string;
	chartType?: string;
}
