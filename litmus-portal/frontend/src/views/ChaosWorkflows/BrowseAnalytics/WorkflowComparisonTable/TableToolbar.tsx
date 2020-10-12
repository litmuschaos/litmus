import {
  Typography,
  InputBase,
  InputAdornment,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  IconButton,
  Avatar,
} from '@material-ui/core';
import React, { ChangeEvent, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@material-ui/icons/Search';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import useTheme from '@material-ui/core/styles/useTheme';
import DateRangeSelector from '../../../../components/DateRangeSelector';
import ButtonOutline from '../../../../components/Button/ButtonOutline';
import useStyles from './styles';

interface ClusterCallBackType {
  (clusterName: string): void;
}

interface RangeCallBackType {
  (selectedStartDate: string, selectedEndDate: string): void;
}

interface CompareCallBackType {
  (compareWorkflows: boolean): void;
}

interface ExportCallBackType {
  (exportAnalytics: boolean): void;
}

interface TableToolBarProps {
  numSelected: number;
  searchToken: string;
  handleSearch: (
    event?: ChangeEvent<{ value: unknown }>,
    token?: string
  ) => void;
  clusters: string[];
  callbackToSetCluster: ClusterCallBackType;
  callbackToSetRange: RangeCallBackType;
  callbackToCompare: CompareCallBackType;
  callbackToExport: ExportCallBackType;
  comparisonState: Boolean;
  reInitialize: Boolean;
}

interface RangeType {
  startDate: string;
  endDate: string;
}

const TableToolBar: React.FC<TableToolBarProps> = ({
  numSelected,
  handleSearch,
  searchToken,
  clusters,
  callbackToSetCluster,
  callbackToSetRange,
  callbackToCompare,
  callbackToExport,
  comparisonState,
  reInitialize,
}) => {
  const classes = useStyles();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const [cluster, setCluster] = React.useState<String>('All');
  const [compare, setCompare] = React.useState<Boolean>(false);
  const [range, setRange] = React.useState<RangeType>({
    startDate: ' ',
    endDate: ' ',
  });
  const [
    isDateRangeSelectorPopoverOpen,
    setDateRangeSelectorPopoverOpen,
  ] = useState(false);
  const dateRangeSelectorRef = useRef<HTMLButtonElement>(null);

  const handleClusterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setCluster(event.target.value as String);
    callbackToSetCluster(event.target.value as string);
  };

  const CallbackFromRangeSelector = (
    selectedStartDate: string,
    selectedEndDate: string
  ) => {
    setRange({ startDate: selectedStartDate, endDate: selectedEndDate });
    callbackToSetRange(
      `${`${selectedStartDate.split(' ')[2]} ${
        selectedStartDate.split(' ')[1]
      } ${selectedStartDate.split(' ')[3]}`}`,
      `${`${selectedEndDate.split(' ')[2]} ${selectedEndDate.split(' ')[1]} ${
        selectedEndDate.split(' ')[3]
      }`}`
    );
  };

  const handleClick = () => {
    setCompare(true);
    callbackToCompare(true);
  };

  const handleExport = () => {
    callbackToExport(true);
  };

  const reInitializer = () => {
    setRange({
      startDate: ' ',
      endDate: ' ',
    });
    setCluster('All');
  };

  useEffect(() => {
    if (comparisonState === false || reInitialize === true) {
      reInitializer();
    }
  }, []);

  return (
    <div className={classes.headerSection}>
      <InputBase
        id="input-with-icon-adornment"
        placeholder="Search"
        className={classes.search}
        value={searchToken}
        onChange={handleSearch}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
      />

      {numSelected > 0 && comparisonState === false ? (
        <span>
          <Typography
            variant="h6"
            className={classes.markStyleCorrect}
            display="inline"
          >
            {'\u2713'}
          </Typography>
          <Typography variant="h6" component="div" display="inline">
            <strong>
              &nbsp; {numSelected}{' '}
              {numSelected === 1
                ? t('analytics.workflowSelected')
                : t('analytics.workflowsSelected')}{' '}
              &nbsp; &emsp;
            </strong>
          </Typography>
        </span>
      ) : (
        <span />
      )}

      <Button
        className={classes.selectDate}
        onClick={() => setDateRangeSelectorPopoverOpen(true)}
        ref={dateRangeSelectorRef}
        aria-label="time range"
        aria-haspopup="true"
      >
        <Typography className={classes.displayDate}>
          {range.startDate === ' '
            ? 'Select Period'
            : `${range.startDate.split(' ')[2]} ${
                range.startDate.split(' ')[1]
              } ${range.startDate.split(' ')[3]} - ${
                range.endDate.split(' ')[2]
              } ${range.endDate.split(' ')[1]} ${range.endDate.split(' ')[3]}`}

          <IconButton className={classes.rangeSelectorIcon}>
            {isDateRangeSelectorPopoverOpen ? (
              <KeyboardArrowDownIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </Typography>
      </Button>

      <FormControl
        variant="outlined"
        className={classes.formControl}
        color="secondary"
        focused
      >
        <InputLabel className={classes.selectText}>
          {t('analytics.targetCluster')}
        </InputLabel>
        <Select
          label="Target cluster"
          value={cluster}
          onChange={handleClusterChange}
          className={classes.selectText}
          color="secondary"
        >
          <MenuItem value="All">All</MenuItem>
          {clusters.map((cluster: string) => (
            <MenuItem value={cluster}>{cluster}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {compare === false || comparisonState === false ? (
        <ButtonOutline
          isDisabled={!(numSelected > 1)}
          handleClick={handleClick}
        >
          <Typography className={classes.dateRangeDefault}>
            {t('analytics.compareWorkflows')}
          </Typography>
        </ButtonOutline>
      ) : (
        <ButtonOutline handleClick={handleExport} isDisabled={false}>
          <div className={classes.export}>
            <Avatar className={classes.exportIcon}>
              <DescriptionOutlinedIcon htmlColor={palette.secondary.dark} />
            </Avatar>
            <Typography className={classes.dateRangeDefault} display="inline">
              {t('analytics.exportPDF')}
            </Typography>
          </div>
        </ButtonOutline>
      )}
      <DateRangeSelector
        anchorEl={dateRangeSelectorRef.current as HTMLElement}
        isOpen={isDateRangeSelectorPopoverOpen}
        onClose={() => {
          setDateRangeSelectorPopoverOpen(false);
        }}
        callbackToSetRange={CallbackFromRangeSelector}
      />
    </div>
  );
};

export default TableToolBar;
