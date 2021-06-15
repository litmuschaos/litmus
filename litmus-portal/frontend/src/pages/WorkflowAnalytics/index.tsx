import { Typography } from '@material-ui/core';
import { ButtonFilled, CalendarHeatmap } from 'litmus-ui';
import React from 'react';
import BackButton from '../../components/Button/BackButton';
import Scaffold from '../../containers/layouts/Scaffold';
import useStyles from './styles';
import { TestCalendarHeatmapTooltip, testData } from './testData';

const valueThreshold = [13, 26, 39, 49, 59, 69, 79, 89, 100];

const AnalyticsPage: React.FC = () => {
  const classes = useStyles();

  return (
    <Scaffold>
      <BackButton />
      {/* Heading of the Page */}
      <div className={classes.headingSection}>
        <div className={classes.pageHeading}>
          <Typography className={classes.heading}>
            Workflow - Basic K8S Conformance
          </Typography>
          <Typography className={classes.subHeading}>
            Here’s the analytic of selected workflow
          </Typography>
        </div>
        <div>
          <ButtonFilled onClick={() => {}}>PDF</ButtonFilled>
        </div>
      </div>
      {/* Information and stats */}
      <div className={classes.infoStatsHeader}>
        <Typography className={classes.sectionHeading}>
          Information and statistics
        </Typography>
      </div>
      <div className={classes.infoStatsSection}>
        <div className={classes.infoStats}>
          {/* Individual Colum for infoStats */}
          <div>
            <Typography className={classes.infoHeader}>
              Workflow details :
            </Typography>
            <Typography>
              Name :{' '}
              <span className={classes.infoHint}>Basic K8S Conformance</span>
            </Typography>
            <Typography>
              Id : <span className={classes.infoHint}>Awez-Yij1-ZxyV23</span>
            </Typography>
            <Typography>
              Subject : <span className={classes.infoHint}>Subject name</span>
            </Typography>
            <Typography>
              Namespace : <span className={classes.infoHint}>litmus</span>
            </Typography>
          </div>

          {/* Row 2 */}
          <div>
            <Typography className={classes.infoHeader}>Agent :</Typography>
            <Typography>
              Name : <span className={classes.infoHint}>Namespace1</span>
            </Typography>
            <Typography>
              Id : <span className={classes.infoHint}>Awez-Yij1-ZxyV23</span>
            </Typography>
          </div>
          {/* Row 3 */}
          <div>
            <Typography className={classes.infoHeader}>
              Total Runs : 10
            </Typography>
            <Typography>
              Last Run :{' '}
              <span className={classes.infoHint}>06th Jan, 2021 11:00pm</span>
            </Typography>
            <Typography>
              Next Run :{' '}
              <span className={classes.infoHint}>06th Jan, 2021 11:00pm</span>
            </Typography>
          </div>
          {/* Row 4 */}
          <div>
            <Typography className={classes.infoHeader}>Regularity :</Typography>
            <Typography>Every Monday at 03:00 AM</Typography>
          </div>
          {/* Column end */}
        </div>
      </div>

      {/* HeatMap Area */}
      <div className={classes.heatmapArea}>
        <Typography className={classes.sectionHeading}>Analytics</Typography>
        <div style={{ width: '100%', height: '10.5rem' }}>
          <CalendarHeatmap
            calendarHeatmapMetric={testData}
            valueThreshold={valueThreshold}
            CalendarHeatmapTooltip={TestCalendarHeatmapTooltip}
          />
        </div>
      </div>
    </Scaffold>
  );
};

export default AnalyticsPage;
