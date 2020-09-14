/* eslint-disable react/no-array-index-key */
import { Popover } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';
import { subDays } from 'date-fns';
import { useState } from 'react';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRangePicker } from 'react-date-range';

interface RangeCallBackType {
  (selectedStartDate: string, selectedEndDate: string): void;
}

interface DateRangeSelectorProps {
  anchorEl: HTMLElement;
  isOpen: boolean;
  onClose: () => void;
  callbackToSetRange: RangeCallBackType;
}

function DateRangeSelector(props: DateRangeSelectorProps) {
  const { anchorEl, isOpen, onClose, callbackToSetRange } = props;

  const classes = useStyles();

  const id = isOpen ? 'profile-popover' : undefined;

  const [state, setState] = useState([
    {
      startDate: subDays(new Date(), 14),
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
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
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
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={1}
            ranges={state}
            direction="vertical"
            scroll={{ enabled: true }}
            editableDateInputs={true}
            rangeColors={['#5B44BA']}
            showMonthAndYearPickers={true}
          />
        </div>
      </Popover>
    </div>
  );
}

export default DateRangeSelector;
