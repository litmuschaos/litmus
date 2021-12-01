import { Button, IconButton, Popover, Typography } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import React, { useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import useStyles from './styles';

interface UsageRangePickerProps {
  isOpen: boolean;
  popAnchorEl: HTMLElement | null;
  displayDate: string;
  popOverClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  popOverClose: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  selectDate: (selectFromDate: string, selectToDate: string) => void;
}

const UsageRangePicker: React.FC<UsageRangePickerProps> = ({
  isOpen,
  popAnchorEl,
  displayDate,
  popOverClick,
  popOverClose,
  selectDate,
}) => {
  const classes = useStyles();
  const { palette } = useTheme();
  const [state, setState] = useState([
    {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  return (
    <div className={classes.dateRangeDiv}>
      <Button className={classes.selectDate} onClick={popOverClick}>
        <Typography className={classes.displayDate}>
          {displayDate}
          <IconButton className={classes.dateRangeIcon}>
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
  );
};

export default UsageRangePicker;
