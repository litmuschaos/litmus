export interface RadialChartMetric {
  value: number;
  label?: string;
  baseColor?: string;
}
const testRadialChartData: RadialChartMetric[] = [
  { value: 60, label: 'Completed', baseColor: '#00CC9A' },
  { value: 30, label: 'Pending', baseColor: '#5252F6' },
  { value: 50, label: 'Failed', baseColor: '#CA2C2C' },
];
export { testRadialChartData };
