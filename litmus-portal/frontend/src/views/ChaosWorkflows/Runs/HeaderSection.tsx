import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Typography,
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import SearchIcon from '@material-ui/icons/Search';
import React, { useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { Clusters } from '../../../models/graphql/clusterData';
import { WorkflowStatus } from '../../../models/graphql/workflowData';
import useStyles from './styles';

interface HeaderSectionProps {
  searchValue?: string;
  statusValue?: WorkflowStatus;
  clusterValue?: string;
  isOpen: boolean;
  clusterList?: Partial<Clusters>;
  isDateOpen: boolean;
  popAnchorEl: HTMLElement | null;
  displayDate: string;
  changeSearch: (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
  changeStatus: (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>,
    child: React.ReactNode
  ) => void;
  changeCluster: (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>,
    child: React.ReactNode
  ) => void;
  popOverClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  popOverClose: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  selectDate: (selectFromDate: string, selectToDate: string) => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  searchValue,
  statusValue,
  clusterValue,
  isOpen,
  popAnchorEl,
  displayDate,
  clusterList,
  changeSearch,
  changeStatus,
  changeCluster,
  popOverClick,
  popOverClose,
  selectDate,
}) => {
  const classes = useStyles();
  const { palette } = useTheme();
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  return (
    <div>
      <div className={classes.headerSection}>
        {/* Search Field */}
        <InputBase
          id="input-with-icon-adornment"
          placeholder="Search"
          className={classes.search}
          value={searchValue}
          onChange={changeSearch}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
        />

        {/* Select Workflow */}
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel className={classes.selectText}>
            Workflow Status
          </InputLabel>
          <Select
            value={statusValue}
            onChange={changeStatus}
            label="Workflow Status"
            className={classes.selectText}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Failed">Failed</MenuItem>
            <MenuItem value="Running">Running</MenuItem>
            <MenuItem value="Succeeded">Completed</MenuItem>
          </Select>
        </FormControl>

        {/* Select Cluster */}
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel className={classes.selectText}>Target Cluster</InputLabel>
          <Select
            value={clusterValue}
            onChange={changeCluster}
            label="Target Cluster"
            className={classes.selectText}
          >
            <MenuItem value="All">All</MenuItem>
            {clusterList?.getCluster?.map((cluster) => (
              <MenuItem key={cluster.cluster_name} value={cluster.cluster_name}>
                {cluster.cluster_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button className={classes.selectDate} onClick={popOverClick}>
          <Typography className={classes.displayDate}>
            {displayDate}
            <IconButton style={{ width: 10, height: 10 }}>
              {isOpen ? <KeyboardArrowDownIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Typography>
        </Button>
        <Popover
          open={isOpen}
          anchorEl={popAnchorEl}
          onClose={popOverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          style={{
            marginTop: 10,
          }}
        >
          <DateRangePicker
            onChange={(item) => {
              setState([(item as any).selection]);
              selectDate(
                `${(item as any).selection.startDate}`,
                `${(item as any).selection.endDate}`
              );
            }}
            showSelectionPreview
            moveRangeOnFirstSelection={false}
            months={1}
            ranges={state}
            direction="vertical"
            editableDateInputs
            rangeColors={[palette.primary.dark]}
            showMonthAndYearPickers
          />
        </Popover>
      </div>
    </div>
  );
};
export default HeaderSection;
