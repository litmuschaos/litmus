import { Typography } from '@material-ui/core';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Wrapper from '../../containers/layouts/Wrapper';
import UsageStats from '../../views/UsageStatistics/UsageStats';
import UsageTable from '../../views/UsageStatistics/UsageTable';
import UsageRangePicker from './datePicker';
import useStyles from './styles';

interface DateRange {
  start_date: string;
  end_date: string;
}

const UsageStatistics = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [popAnchorEl, setPopAnchorEl] = React.useState<null | HTMLElement>(
    null
  );

  /**
   * State variable to set date in UNIX format
   */
  const [dates, setDates] = React.useState<DateRange>({
    start_date: Math.trunc(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() /
        1000
    ).toString(),
    end_date: Math.trunc(new Date().getTime() / 1000).toString(),
  });

  /**
   * State variable for displaying dates
   */
  const [displayDate, setDisplayDate] = React.useState<string>(
    `${moment(parseInt(dates.start_date, 10) * 1000).format(
      'DD.MM.YY'
    )}-${moment(parseInt(dates.end_date, 10) * 1000).format('DD.MM.YY')}`
  );

  const isOpen = Boolean(popAnchorEl);

  const handlePopOverClose = () => {
    setPopAnchorEl(null);
  };

  const handlePopOverClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopAnchorEl(event.currentTarget);
  };
  const dateChange = (selectStartDate: string, selectEndDate: string) => {
    // Change the display value of date range
    setDisplayDate(
      `${moment(selectStartDate).format('DD.MM.YYYY').toString()}-${moment(
        selectEndDate
      )
        .format('DD.MM.YYYY')
        .toString()}`
    );
    setDates({
      start_date: moment(selectStartDate).unix().toString(),
      end_date: moment(selectEndDate)
        .add(23, 'hours')
        .add(59, 'minutes')
        .add(59, 'seconds')
        .add(59, 'milliseconds')
        .unix()
        .toString(),
    });
  };
  return (
    <Wrapper>
      <Typography variant="h3">{t('usage.usageHeader')}</Typography>
      <div style={{ display: 'flex' }}>
        <Typography className={classes.description}>
          {t('usage.usageSubtitle')}
        </Typography>
        <UsageRangePicker
          popOverClick={handlePopOverClick}
          popOverClose={handlePopOverClose}
          isOpen={isOpen}
          popAnchorEl={popAnchorEl}
          displayDate={displayDate}
          selectDate={dateChange}
        />
      </div>

      <UsageStats start_time={dates.start_date} end_time={dates.end_date} />
      <br />
      <br />
      <Typography variant="h4">{t('usage.projectStatistics')}</Typography>
      <Typography className={classes.description}>
        {t('usage.projectSubtitle')}
      </Typography>
      <UsageTable start_time={dates.start_date} end_time={dates.end_date} />
    </Wrapper>
  );
};

export default UsageStatistics;
