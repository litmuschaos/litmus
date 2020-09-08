import React from 'react';
import {
  InputBase,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Popover,
  Button,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { DateRangePicker } from 'materialui-daterange-picker';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import useStyles from './styles';

interface HeaderSectionProps {
  searchValue: string;
  statusValue: string;
  clusterValue: string;
  isOpen: boolean;
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
  toggle: () => void;
  selectDate: (range: any) => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  searchValue,
  statusValue,
  clusterValue,
  isOpen,
  popAnchorEl,
  isDateOpen,
  displayDate,
  changeSearch,
  changeStatus,
  changeCluster,
  popOverClick,
  popOverClose,
  toggle,
  selectDate,
}) => {
  const classes = useStyles();

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
        <FormControl
          variant="outlined"
          className={classes.formControl}
          color="secondary"
          focused
        >
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
            <MenuItem value="Succeeded">Succeeded</MenuItem>
          </Select>
        </FormControl>

        {/* Select Cluster */}
        <FormControl
          variant="outlined"
          className={classes.formControl}
          color="secondary"
          focused
        >
          <InputLabel className={classes.selectText}>Target Cluster</InputLabel>
          <Select
            value={clusterValue}
            onChange={changeCluster}
            label="Target Cluster"
            className={classes.selectText}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Predefined">Cluset pre-defined</MenuItem>
            <MenuItem value="Kubernetes">Kubernetes Cluster</MenuItem>
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
            open={isDateOpen}
            toggle={toggle}
            onChange={selectDate}
          />
        </Popover>
      </div>
    </div>
  );
};
export default HeaderSection;
