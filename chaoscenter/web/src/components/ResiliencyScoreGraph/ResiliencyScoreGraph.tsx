import React, { useRef, useState, useMemo } from 'react';
import { scaleTime, scaleLinear } from '@visx/scale';
import { Brush } from '@visx/brush';
import type { Bounds } from '@visx/brush/lib/types';
import type BaseBrush from '@visx/brush/lib/BaseBrush';
import type { BaseBrushState, UpdateBrush } from '@visx/brush/lib/BaseBrush';
import { PatternLines } from '@visx/pattern';
import { LinearGradient } from '@visx/gradient';
import { max, extent } from 'd3-array';
import { Button, ButtonVariation } from '@harnessio/uicore';
import VisxAreaChart from './VisxAreaChart';

interface GraphDataProps {
  resilienceScore: number;
  updatedAt: Date;
}

const brushMargin = { top: 10, bottom: 10, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = 'brush_pattern';
const GRADIENT_ID = 'brush_gradient';
export const background = '#ffffff';
export const background2 = '#ffffff';
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: '#0278D5'
};

// accessors
const getDate = (d: GraphDataProps): Date => d && d.updatedAt;
const getResilienceValue = (d: GraphDataProps): number => d.resilienceScore;

export type BrushProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  compact?: boolean;
};

interface ResiliencyScoreGraphProps extends BrushProps {
  graphData: GraphDataProps[];
}

function ResiliencyScoreGraph({
  compact = false,
  width,
  height,
  margin = {
    top: 10,
    left: 50,
    bottom: 10,
    right: 20
  },
  graphData
}: ResiliencyScoreGraphProps): JSX.Element {
  const stock = graphData;

  const brushRef = useRef<BaseBrush | null>(null);
  const [filteredStock, setFilteredStock] = useState<GraphDataProps[]>(stock);

  const onBrushChange = (domain: Bounds | null): void => {
    if (!domain) return;
    const { x0, x1 } = domain;
    const stockCopy = stock.filter(s => {
      const x = getDate(s).getTime();
      return x > x0 && x < x1;
    });
    setFilteredStock(stockCopy);
  };

  const innerHeight = height - margin.top - margin.bottom;
  const topChartBottomMargin = compact ? chartSeparation / 2 : chartSeparation + 10;
  const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
  const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

  // bounds
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(topChartHeight, 0);
  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(bottomChartHeight - brushMargin.top - brushMargin.bottom, 0);

  // scales
  const dateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xMax],
        domain: extent(filteredStock, getDate) as [Date, Date]
      }),
    [xMax, filteredStock]
  );
  const stockScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, max(filteredStock, getResilienceValue) || 0],
        nice: true
      }),
    [yMax, filteredStock]
  );
  const brushDateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xBrushMax],
        domain: extent(stock, getDate) as [Date, Date]
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [xBrushMax]
  );
  const brushStockScale = useMemo(
    () =>
      scaleLinear({
        range: [yBrushMax, 0],
        domain: [0, max(stock, getResilienceValue) || 0],
        nice: true
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [yBrushMax]
  );

  const initialBrushPosition = useMemo(
    () => ({
      start: { x: brushDateScale(getDate(stock[0])) },
      end: { x: brushDateScale(getDate(stock.length > 0 ? stock[stock.length / 2] : stock[0])) }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brushDateScale]
  );

  // event handlers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleClearClick = (): void => {
    if (brushRef?.current) {
      setFilteredStock(stock);
      brushRef.current.reset();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleResetClick = (): void => {
    if (brushRef?.current) {
      const updater: UpdateBrush = prevBrush => {
        const newExtent = brushRef.current?.getExtent(initialBrushPosition.start, initialBrushPosition.end);
        let newState;
        if (newExtent) {
          newState = {
            ...prevBrush,
            start: { y: newExtent.y0, x: newExtent.x0 },
            end: { y: newExtent.y1, x: newExtent.x1 },
            extent: newExtent
          };
        }

        return newState as BaseBrushState;
      };
      brushRef.current.updateBrush(updater);
    }
  };

  return (
    <div>
      <svg width={width} height={height}>
        <LinearGradient id={GRADIENT_ID} from={background} to={background2} />
        <rect x={0} y={0} width={width} height={height} fill={`url(#ffffff)`} rx={14} />
        <VisxAreaChart
          hideBottomAxis={compact}
          data={filteredStock}
          width={width}
          margin={{ ...margin, bottom: topChartBottomMargin }}
          yMax={yMax}
          xScale={dateScale}
          yScale={stockScale}
          gradientColor={'#CDF4FE'}
        />
        <VisxAreaChart
          hideBottomAxis
          hideLeftAxis
          data={stock}
          width={width}
          yMax={yBrushMax}
          xScale={brushDateScale}
          yScale={brushStockScale}
          margin={brushMargin}
          top={topChartHeight + topChartBottomMargin + margin.top}
          gradientColor={'#CDF4FE'}
        >
          <PatternLines
            id={PATTERN_ID}
            height={8}
            width={8}
            stroke={'#0278D5'}
            strokeWidth={1}
            orientation={['diagonal']}
          />
          <Brush
            xScale={brushDateScale}
            yScale={brushStockScale}
            width={xBrushMax}
            height={yBrushMax}
            margin={brushMargin}
            handleSize={8}
            innerRef={brushRef}
            resizeTriggerAreas={['left', 'right']}
            brushDirection="horizontal"
            initialBrushPosition={initialBrushPosition}
            onChange={onBrushChange}
            onClick={() => setFilteredStock(stock)}
            selectedBoxStyle={selectedBrushStyle}
            useWindowMoveEvents
          />
        </VisxAreaChart>
      </svg>
      <Button
        variation={ButtonVariation.PRIMARY}
        text="Clear"
        icon="reset"
        onClick={handleClearClick}
        style={{ display: 'none' }}
      />
      <Button
        variation={ButtonVariation.PRIMARY}
        text="Reset"
        icon="reset"
        onClick={handleResetClick}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default ResiliencyScoreGraph;
