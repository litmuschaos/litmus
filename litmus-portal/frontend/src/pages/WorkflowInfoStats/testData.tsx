import React from 'react';

export interface GenericValue {
  // Generic structure
  [index: string]: any;
}
export interface ToolTip<T> {
  // Generic data for Tooltip
  data: T;
}

export type ToolTipValue = ToolTip<GenericValue>;

export interface DayData {
  // Value is the variable used for the internal calculation
  // of the colors
  value: number | undefined;

  // Other data that belongs to the structure
  [index: string]: any;
}
export interface WeekData {
  // Bins corresonds to bin of the days combined
  bins: DayData[];
}

export type CalendarHeatmapTooltipProps = {
  // Used for the tooltip to receive Tooltip data for the contruction of tooltip UI
  tooltipData: ToolTipValue;
};

export type CalendarHeatMap = {
  // Width of one node/bin
  binWidth?: number;

  // Height of one node/bin
  binHeight?: number;

  // Metric for the calendarHeatmap component
  // where the data is the array of WeekData and each element in the
  // WeekData corresponds to a day
  calendarHeatmapMetric: Array<WeekData>;

  // Margin for the graph grid
  margin?: { top: number; right: number; bottom: number; left: number };

  // Array of breakpoints for the color change
  valueThreshold: Array<number>;

  // Array of colors for the value of the data corresponding to the
  // breakpoints
  colorMap?: Array<string>;

  // Function for handling the click event on the single node/bin/rect
  handleBinClick?: (bin: any) => void;

  // For the setting up the data to be shown in the tooltip
  CalendarHeatmapTooltip: ({
    tooltipData,
  }: CalendarHeatmapTooltipProps) => React.ReactElement;
};

export interface CalendarHeatMapChildProps extends CalendarHeatMap {
  // Width of the parent
  width?: number;

  // Height of the parent
  height?: number;
}

const TestCalendarHeatmapTooltip = ({
  tooltipData,
}: CalendarHeatmapTooltipProps): React.ReactElement => {
  return (
    <div>
      <div style={{ marginBottom: '0.2rem' }}>
        {tooltipData?.data?.bin?.bin.value}% Average Resiliency
      </div>
      <div>{tooltipData?.data?.bin?.bin.workflowCount} runs</div>
    </div>
  );
};

const testData: Array<WeekData> = [
  {
    bins: [
      { value: -1 },
      { value: -1 },
      { value: -1 },
      { value: -1 },
      { value: undefined },
      { value: undefined },
      { value: undefined },
    ],
  },
  {
    bins: [
      { value: 0, workflowCount: 10 },
      { value: 14, workflowCount: 10 },
      { value: 27, workflowCount: 10 },
      { value: 40, workflowCount: 10 },
      { value: 50, workflowCount: 10 },
      { value: 60, workflowCount: 10 },
      { value: 70, workflowCount: 10 },
    ],
  },
  {
    bins: [
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
    ],
  },
  {
    bins: [
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
    ],
  },
  {
    bins: [
      { value: 60 },
      { value: 70 },
      { value: 80 },
      { value: 90 },
      { value: 99 },
      { value: 100 },
      { value: undefined },
    ],
  },
  {
    bins: [
      { value: 20 },
      { value: 20 },
      { value: 20 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 40 },
    ],
  },
  {
    bins: [
      { value: 20 },
      { value: 20 },
      { value: 20 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 70 },
      { value: 80 },
      { value: 90 },
      { value: 100 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 100 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: undefined },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: undefined },
      { value: undefined },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 10 },
      { value: undefined },
      { value: 10 },
      { value: 10 },
      { value: 10 },
      { value: 1 },
    ],
  },
  {
    bins: [
      { value: 0 },
      { value: 14 },
      { value: 27 },
      { value: 40 },
      { value: 50 },
      { value: 60 },
      { value: 70 },
    ],
  },
  {
    bins: [
      { value: 80 },
      { value: 90 },
      { value: 100 },
      { value: 0 },
      { value: 15 },
      { value: 25 },
      { value: 40 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 20 },
      { value: 30 },
      { value: 40 },
      { value: 50 },
      { value: 50 },
      { value: 50 },
    ],
  },
  {
    bins: [
      { value: 60 },
      { value: 70 },
      { value: 80 },
      { value: 90 },
      { value: 99 },
      { value: 100 },
      { value: undefined },
    ],
  },
  {
    bins: [
      { value: 20 },
      { value: 20 },
      { value: 20 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 40 },
    ],
  },
  {
    bins: [
      { value: 20 },
      { value: 20 },
      { value: 20 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 70 },
      { value: 80 },
      { value: 90 },
      { value: 100 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 100 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
    ],
  },
  {
    bins: [
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: undefined },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 14 },
      { value: 25 },
      { value: 10 },
      { value: 15 },
      { value: 25 },
      { value: 10 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 10 },
      { value: undefined },
      { value: 10 },
      { value: 10 },
      { value: 10 },
      { value: 1 },
    ],
  },
  {
    bins: [
      { value: 0 },
      { value: 14 },
      { value: 27 },
      { value: 40 },
      { value: 50 },
      { value: 60 },
      { value: 70 },
    ],
  },
  {
    bins: [
      { value: 80 },
      { value: 90 },
      { value: 100 },
      { value: 0 },
      { value: 15 },
      { value: 25 },
      { value: 40 },
    ],
  },
  {
    bins: [
      { value: 10 },
      { value: 20 },
      { value: 30 },
      { value: 40 },
      { value: 50 },
      { value: 50 },
      { value: 50 },
    ],
  },
  {
    bins: [
      { value: 0 },
      { value: 5 },
      { value: 10 },
      { value: 15 },
      { value: 20 },
      { value: 25 },
      { value: 30 },
    ],
  },
  {
    bins: [
      { value: 35 },
      { value: 40 },
      { value: 45 },
      { value: 50 },
      { value: 55 },
      { value: 60 },
      { value: 65 },
    ],
  },
  {
    bins: [
      { value: 70 },
      { value: 75 },
      { value: 80 },
      { value: 85 },
      { value: 90 },
      { value: 95 },
      { value: 100 },
    ],
  },
];
export { testData, TestCalendarHeatmapTooltip };
