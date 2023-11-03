export type ColumnData = {
  color: string;
  height: number;
  popoverContent?: React.ReactNode;
  label?: string;
  path?: string;
};

export interface ColumnChartProps {
  xAxisLabel: string;
  yAxisLabel: string;
  data: ColumnData[] | undefined;
  gridLines?: Array<number>;
  isLoading?: boolean;
  columnHeight?: number;
}
