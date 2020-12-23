/* eslint-disable max-len */
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import Plotly from 'plotly.js';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import createPlotlyComponent from 'react-plotly.js/factory';
import useActions from '../../../redux/actions';
import * as TabActions from '../../../redux/actions/tabs';
import { history } from '../../../redux/configureStore';
import Score from './Score';
import useStyles from './style';

const Plot = createPlotlyComponent(Plotly);

interface ResilienceScoreComparisonPlotProps {
  xData: { Hourly: string[][]; Daily: string[][]; Monthly: string[][] };
  yData: { Hourly: number[][]; Daily: number[][]; Monthly: number[][] };
  labels: string[];
}

const ResilienceScoreComparisonPlot: React.FC<ResilienceScoreComparisonPlotProps> = ({
  xData,
  yData,
  labels,
}) => {
  const classes = useStyles();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const tabs = useActions(TabActions);
  const [currentGranularity, setCurrentGranularity] = React.useState<{
    name: string;
  }>({
    name: 'Daily',
  });
  const [plotData, setPlotData] = React.useState<any[]>([]);
  const [edgeData, setEdgeData] = React.useState({
    highScore: 0,
    lowScore: 0,
    highColor: '',
    lowColor: '',
    highName: '',
    lowName: '',
  });
  const [plotLayout, setPlotLayout] = React.useState<any>({});

  const handleChangeInGranularity = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const name = event.target.name as keyof typeof currentGranularity;
    if (name !== currentGranularity.name) {
      setCurrentGranularity({
        ...currentGranularity,
        [name]: event.target.value as string,
      });
    }
  };

  const processData = () => {
    let dataX = [['']];
    let dataY = [[0]];
    if (currentGranularity.name === 'Hourly') {
      dataX = xData.Hourly;
      dataY = yData.Hourly;
    }
    if (currentGranularity.name === 'Daily') {
      dataX = xData.Daily;
      dataY = yData.Daily;
    }
    if (currentGranularity.name === 'Monthly') {
      dataX = xData.Monthly;
      dataY = yData.Monthly;
    }
    const colors = [
      palette.secondary.main,
      palette.warning.main,
      palette.primary.dark,
      palette.error.dark,
    ];
    const lineSize = [3, 3, 3, 3];
    const data = [];
    const series: number[] = Array(labels.length).fill(0);
    const lengths: number[] = Array(labels.length).fill(0);
    for (let i = 0; i < dataX.length; i += 1) {
      const result = {
        x: dataX[i],
        y: dataY[i],
        type: 'scatter',
        mode: 'lines + text',
        line: {
          shape: 'spline',
          color: colors[i],
          width: lineSize[i],
        },
        text: labels[i],
        textposition: 'top center',
        textfont: {
          family: 'Ubuntu',
          size: 12,
          fontWeight: 500,
          color: colors[i],
        },
        name: '',
      };
      data.push(result);
      for (let j = 0; j < dataY[i].length; j += 1) {
        series[i] += dataY[i][j];
      }
      lengths[i] = dataY[i].length;
    }

    const normalized: number[] = Array(labels.length).fill(0);
    for (let k = 0; k < lengths.length; k += 1) {
      normalized[k] = series[k] / lengths[k];
    }
    const max = Math.max(...normalized);
    const maxID = normalized.indexOf(max);
    const min = Math.min(...normalized);
    const minID = normalized.indexOf(min);

    setEdgeData({
      highScore: max,
      lowScore: min,
      highColor: colors[maxID],
      lowColor: colors[minID],
      highName: labels[maxID],
      lowName: labels[minID],
    });
    setPlotData(data);
  };

  const selectorOptions = {
    buttons: [
      {
        step: 'day',
        stepmode: 'backward',
        count: 1,
        label: '1 Day',
      },
      {
        step: 'day',
        stepmode: 'backward',
        count: 7,
        label: '1 Week',
      },
      {
        step: 'day',
        stepmode: 'backward',
        count: 14,
        label: '2 Weeks',
      },
      {
        step: 'month',
        stepmode: 'backward',
        count: 1,
        label: '1 Month',
      },
      {
        step: 'month',
        stepmode: 'backward',
        count: 3,
        label: '3 Months',
      },
      {
        step: 'month',
        stepmode: 'backward',
        count: 6,
        label: '6 Months',
      },
      {
        step: 'year',
        stepmode: 'backward',
        count: 1,
        label: '1 Year',
      },
      {
        step: 'year',
        stepmode: 'backward',
        count: 2,
        label: '2 Years',
      },
      {
        step: 'all',
        label: 'default',
      },
    ],
  };

  const processLayout = () => {
    const layout = {
      showlegend: false,
      height: 405,
      width: 610,
      xaxis: {
        showgrid: true,
        showline: false,
        showticklabels: true,
        linecolor: palette.graphAnnotationsColor,
        linewidth: 0.5,
        ticks: 'outside',
        tickcolor: palette.graphAnnotationsColor,
        tickwidth: 2,
        ticklen: 5,
        tickfont: {
          family: 'Ubuntu',
          color: palette.customColors.black(0.4),
        },
        mirror: true,
        rangeselector: selectorOptions as any,
        rangeslider: { visible: true },
      },
      yaxis: {
        showgrid: true,
        zeroline: false,
        showline: false,
        showticklabels: true,
        linecolor: palette.graphAnnotationsColor,
        linewidth: 0.5,
        ticks: 'outside',
        tickcolor: palette.graphAnnotationsColor,
        tickwidth: 2,
        ticklen: 5,
        tickfont: {
          family: 'Ubuntu',
          color: palette.customColors.black(0.4),
        },
        mirror: true,
        tickmode: 'array',
        tickvals: [0, 20, 40, 60, 80, 100],
        ticktext: ['0', '20', '40', '60', '80', '100'],
        range: [-10, 110],
      },
      cliponaxis: true,
      layer: 'below_traces',
      autosize: false,
      margin: {
        autoexpand: false,
        l: 30,
        r: 30,
        t: 30,
        b: 105,
      },
      font: {
        family: 'Ubuntu, monospace',
        color: palette.customColors.black(0.4),
      },
    };
    setPlotLayout(layout);
  };

  const redirect = () => {
    tabs.changeWorkflowsTabs(3);
    history.push('/workflows');
  };

  useEffect(() => {
    processData();
    processLayout();
  }, [currentGranularity]);

  return (
    <div style={{ alignContent: 'center' }}>
      <div className={classes.flexDisplay}>
        <div className={classes.adjust}>
          <Score
            score={edgeData.highScore}
            high
            color={edgeData.highColor}
            name={edgeData.highName}
          />
        </div>
        <Score
          score={edgeData.lowScore}
          high={false}
          color={edgeData.lowColor}
          name={edgeData.lowName}
        />
        <FormControl
          variant="outlined"
          className={classes.formControl}
          color="secondary"
          focused
        >
          <InputLabel
            htmlFor="outlined-selection-granularity"
            className={classes.root}
          >
            {t('home.resilienceScoreComparisonOptions.granularity')}
          </InputLabel>
          <Select
            value={currentGranularity.name}
            onChange={handleChangeInGranularity}
            label="Granularity"
            inputProps={{
              name: 'name',
              id: 'outlined-selection-granularity',
            }}
            className={classes.root}
          >
            <MenuItem value="Hourly">
              {t('home.resilienceScoreComparisonOptions.option1')}
            </MenuItem>
            <MenuItem value="Daily">
              {t('home.resilienceScoreComparisonOptions.option2')}
            </MenuItem>
            <MenuItem value="Monthly">
              {t('home.resilienceScoreComparisonOptions.option3')}
            </MenuItem>
          </Select>
        </FormControl>
        <Tooltip title="Analytics">
          <IconButton
            aria-label="Analytics"
            onClick={redirect}
            className={classes.analyticsBtnPos}
          >
            <AssessmentOutlinedIcon
              color="secondary"
              className={classes.analyticsButton}
            />
          </IconButton>
        </Tooltip>
      </div>
      <div className={classes.plot}>
        <Plot
          data={plotData}
          layout={plotLayout}
          useResizeHandler
          style={{
            width: 'fit-content',
            margin: 'auto',
          }}
          config={{
            displaylogo: false,
            autosizable: true,
            responsive: true,
            frameMargins: 0.2,
            showAxisDragHandles: true,
            showAxisRangeEntryBoxes: true,
            showTips: true,
            displayModeBar: false,
            toImageButtonOptions: {
              format: 'png',
              filename: `Top4_ResilienceScores_Comparison-${new Date().toString()}`,
              width: 1920,
              height: 1080,
              scale: 2,
            },
          }}
        />
      </div>
    </div>
  );
};

export default ResilienceScoreComparisonPlot;
