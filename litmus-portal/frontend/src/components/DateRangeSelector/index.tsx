/* eslint-disable react/no-array-index-key */
import { Popover } from '@material-ui/core';
import React, { useState } from 'react';
import { subDays } from 'date-fns';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRangePicker } from 'react-date-range';
import { useTheme } from '@material-ui/core/styles';
import useStyles from './styles';

interface RangeCallBackType {
  (selectedStartDate: string, selectedEndDate: string): void;
}

interface DateRangeSelectorProps {
  anchorEl: HTMLElement;
  isOpen: boolean;
  onClose: () => void;
  callbackToSetRange: RangeCallBackType;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  anchorEl,
  isOpen,
  onClose,
  callbackToSetRange,
}) => {
  const classes = useStyles();
  const { palette } = useTheme();
  const id = isOpen ? 'profile-popover' : undefined;
  const [state, setState] = useState([
    {
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  return (
    <div>
      <Popover
        id={id}
        open={isOpen}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{
          paper: classes.popoverDateRangeSelector,
        }}
      >
        <div className={classes.dateRangeSelectorContainer}>
          <DateRangePicker
            onChange={(item) => {
              setState([(item as any).selection]);
              callbackToSetRange(
                `${(item as any).selection.startDate}`,
                `${(item as any).selection.endDate}`
              );
            }}
            showSelectionPreview
            moveRangeOnFirstSelection={false}
            months={1}
            ranges={state}
            direction="vertical"
            scroll={{ enabled: true }}
            editableDateInputs
            rangeColors={[palette.secondary.dark]}
            showMonthAndYearPickers
          />
        </div>
      </Popover>
    </div>
  );
};

export default DateRangeSelector;
