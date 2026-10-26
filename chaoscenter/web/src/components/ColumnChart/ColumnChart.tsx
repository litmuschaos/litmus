import React from 'react';
import { Classes, PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core';
import cx from 'classnames';
import { Text, Container, Popover, Layout } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { useHistory } from 'react-router-dom';
import FallbackBox from '@images/FallbackBox.svg';
import { useStrings } from '@strings';
import type { ColumnChartProps } from './ColumnChart.types';
import css from './ColumnChart.module.scss';

const COLUMN_HEIGHT = 90;
const MIN_COLUMN_WIDTH = 12;
const MID_COLUMN_WIDTH = 30;
const MAX_COLUMN_WIDTH = 48;
const TOTAL_COLUMNS = 50;
const LOADING_COLUMNS = Array(TOTAL_COLUMNS)
  .fill(null)
  .map(() => Math.random() * 101);

export default function ColumnChart(props: ColumnChartProps): JSX.Element {
  const { getString } = useStrings();
  const history = useHistory();
  const { data, xAxisLabel, yAxisLabel, gridLines, isLoading, columnHeight = COLUMN_HEIGHT } = props;
  const [columnWidth, setColumnWidth] = React.useState<number>(MIN_COLUMN_WIDTH);

  React.useEffect(() => {
    if (data) {
      if (data.length <= 10) return setColumnWidth(MAX_COLUMN_WIDTH);
      if (data.length <= 25 && data.length > 10) return setColumnWidth(MID_COLUMN_WIDTH);
    }
    return setColumnWidth(MIN_COLUMN_WIDTH);
  }, [data]);

  if (isLoading) {
    return (
      <Container
        background={Color.WHITE}
        style={{ position: 'relative' }}
        padding={'medium'}
        className={css.mainContainerShadow}
      >
        <div className={css.main}>
          <div className={cx(css.columns, css.graph)}>
            {LOADING_COLUMNS.map((val, index) => (
              <div
                key={index}
                style={{
                  height: Math.floor((val / 100) * columnHeight),
                  width: MIN_COLUMN_WIDTH
                }}
                className={cx(css.column, Classes.SKELETON)}
              />
            ))}
          </div>
          <div className={cx(css.columns, css.xAxisLabels)}>
            {LOADING_COLUMNS.map((_, index) => {
              return (
                <div
                  key={index}
                  style={{
                    width: MIN_COLUMN_WIDTH
                  }}
                  className={cx(css.xAxisRunNumberLabel, Classes.SKELETON)}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    );
  }

  if (!data?.length) {
    return (
      <Layout.Vertical
        padding={'medium'}
        flex={{ alignItems: 'center', justifyContent: 'center' }}
        width={'100%'}
        height={164}
        spacing="medium"
      >
        <img src={FallbackBox} height={100} alt="searchEmptyState" />
        <Text font={{ variation: FontVariation.H6, weight: 'light' }} color={Color.GREY_600}>
          {getString('latestRunFallbackText')}
        </Text>
      </Layout.Vertical>
    );
  }

  return (
    <Container
      background={Color.WHITE}
      style={{ position: 'relative' }}
      padding={'medium'}
      className={css.mainContainerShadow}
    >
      <div className={css.main}>
        <div className={cx(css.columns, css.graph)}>
          <div className={css.yAxisLabel}>{yAxisLabel}</div>
          {gridLines?.map((percent, index) => {
            if (percent >= 0 && percent <= 100)
              return (
                <div key={index} style={{ bottom: `${percent}%` }} className={css.scale}>
                  <span>{percent}%</span>
                </div>
              );
          })}
          {data.map((node, index) => {
            return (
              <div
                key={index}
                style={{
                  backgroundColor: node.color,
                  height: Math.floor(((node.height || 0) / 100) * columnHeight),
                  width: columnWidth,
                  cursor: node.path ? 'pointer' : 'auto'
                }}
                className={css.column}
                onClick={() => node.path && history.push(node.path)}
              >
                {node.popoverContent ? (
                  <Popover
                    content={
                      <Container padding={'small'} background={Color.WHITE} style={{ borderRadius: '3px' }}>
                        {node.popoverContent}
                      </Container>
                    }
                    position={PopoverPosition.TOP}
                    interactionKind={PopoverInteractionKind.HOVER}
                  >
                    <Container height={columnHeight} width={columnWidth} />
                  </Popover>
                ) : (
                  <Container height={columnHeight} width={columnWidth} />
                )}
              </div>
            );
          })}
          <div className={css.xAxisLabel}>{xAxisLabel}</div>
        </div>
        <div className={cx(css.columns, css.xAxisLabels)}>
          {data.reverse().map((node, index) => {
            return (
              <div
                key={index}
                style={{
                  width: columnWidth
                }}
                className={css.xAxisRunNumberLabel}
              >
                {node.label ?? index + 1}
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
