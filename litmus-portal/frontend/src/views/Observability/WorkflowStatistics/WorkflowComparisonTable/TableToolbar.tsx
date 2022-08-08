import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@material-ui/core';
import useTheme from '@material-ui/core/styles/useTheme';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { ButtonOutlined, Search } from 'litmus-ui';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DateRangeSelector from '../../../../components/DateRangeSelector';
import useStyles, { useOutlinedInputStyles } from './styles';

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
  (exportStatistics: boolean): void;
}

interface TableToolBarProps {
  numSelected: number;
  searchToken: string;
  handleSearch: (
    event?: ChangeEvent<{ value: unknown }>,
    token?: string
  ) => void;
  clusters: string[];
  workflowType: string;
  workflowTypeFilterHandler: (value: string) => void;
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
  workflowType,
  workflowTypeFilterHandler,
  callbackToSetCluster,
  callbackToSetRange,
  callbackToCompare,
  callbackToExport,
  comparisonState,
  reInitialize,
}) => {
  const classes = useStyles();
  const outlinedInputClasses = useOutlinedInputStyles();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const [cluster, setCluster] = React.useState<String>('All');
  const [compare, setCompare] = React.useState<Boolean>(false);
  const [range, setRange] = React.useState<RangeType>({
    startDate: ' ',
    endDate: ' ',
  });
  const [isDateRangeSelectorPopoverOpen, setDateRangeSelectorPopoverOpen] =
    useState(false);
  const dateRangeSelectorRef = useRef<HTMLButtonElement>(null);

  const handleClusterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setCluster(event.target.value as String);
    callbackToSetCluster(event.target.value as string);
  };

  const handleWorkflowTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    workflowTypeFilterHandler(event.target.value as string);
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
      <div className={classes.search}>
        <Search
          id="input-with-icon-textfield"
          placeholder="Search"
          value={searchToken}
          onChange={handleSearch}
        />
      </div>

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
                ? t('observability.workflowSelected')
                : t('observability.workflowsSelected')}{' '}
              &nbsp; &emsp;
            </strong>
          </Typography>
        </span>
      ) : (
        <span />
      )}

      <Button
        className={`${classes.selectDate} ${
          isDateRangeSelectorPopoverOpen ? classes.selectDateFocused : ''
        }`}
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
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </Typography>
      </Button>
      <DateRangeSelector
        anchorEl={dateRangeSelectorRef.current as HTMLElement}
        isOpen={isDateRangeSelectorPopoverOpen}
        onClose={() => setDateRangeSelectorPopoverOpen(false)}
        callbackToSetRange={CallbackFromRangeSelector}
      />

      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel className={classes.selectText}>Scenario Type</InputLabel>
        <Select
          label="Chaos Scenario Type"
          value={workflowType}
          onChange={handleWorkflowTypeChange}
          className={classes.selectText}
          input={<OutlinedInput classes={outlinedInputClasses} />}
          IconComponent={KeyboardArrowDownIcon}
          MenuProps={{
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'right',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
            getContentAnchorEl: null,
            classes: { paper: classes.menuList },
          }}
        >
          <MenuItem value="All">
            {t('chaosWorkflows.browseSchedules.options.all')}
          </MenuItem>
          <MenuItem value="workflow">
            {t('chaosWorkflows.browseSchedules.options.workflow')}
          </MenuItem>
          <MenuItem value="cronworkflow">
            {t('chaosWorkflows.browseSchedules.options.cronworkflow')}
          </MenuItem>
        </Select>
      </FormControl>

      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel className={classes.selectText}>
          {t('observability.targetCluster')}
        </InputLabel>
        <Select
          label="Chaos Delegate"
          value={cluster}
          onChange={handleClusterChange}
          className={classes.selectText}
          input={<OutlinedInput classes={outlinedInputClasses} />}
          IconComponent={KeyboardArrowDownIcon}
          MenuProps={{
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'right',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
            getContentAnchorEl: null,
            classes: { paper: classes.menuList },
          }}
        >
          <MenuItem value="All" className={classes.menuListItem}>
            All
          </MenuItem>
          {clusters.map((cluster: string) => (
            <MenuItem
              key={`${cluster}-litmusDashboard-workflowComparison-toolBar`}
              value={cluster}
              className={classes.menuListItem}
            >
              {cluster}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className={classes.featureButtons}>
        {compare === false || comparisonState === false ? (
          <ButtonOutlined
            disabled={!(numSelected > 1)}
            onClick={handleClick}
            className={classes.dateRangeDefault}
          >
            <Typography>{t('observability.compareWorkflows')}</Typography>
          </ButtonOutlined>
        ) : (
          <ButtonOutlined
            onClick={handleExport}
            disabled={false}
            className={classes.dateRangeDefault}
          >
            <div className={classes.export}>
              <DescriptionOutlinedIcon
                htmlColor={palette.primary.main}
                className={classes.exportIcon}
              />
              <Typography display="inline">
                {t('observability.exportPDF')}
              </Typography>
            </div>
          </ButtonOutlined>
        )}
      </div>
    </div>
  );
};

export default TableToolBar;
