import { Popover, Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';
import timeDifferenceForDate from '../../utils/datesModifier';

interface TimePopOverProps {
  unixTime: string;
}

const TimePopOver: React.FC<TimePopOverProps> = ({ unixTime }) => {
  const classes = useStyles();
  const [lastUpdatedAnchorEl, setLastUpdatedAnchorEl] =
    React.useState<HTMLElement | null>(null);

  const handleLastUpdatedOpen = (
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    setLastUpdatedAnchorEl(event.currentTarget);
  };

  const handleLastUpdatedClose = () => {
    setLastUpdatedAnchorEl(null);
  };

  const lastUpdatedOpen = Boolean(lastUpdatedAnchorEl);
  return (
    <div>
      <Typography
        aria-owns={lastUpdatedOpen ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        onMouseEnter={handleLastUpdatedOpen}
        onMouseLeave={handleLastUpdatedClose}
        className={classes.lastUpdatedText}
      >
        {timeDifferenceForDate(unixTime)}
      </Typography>
      <Popover
        id="mouse-over-popover"
        className={classes.LastUpdatedPopover}
        classes={{
          paper: classes.paper,
        }}
        open={lastUpdatedOpen}
        anchorEl={lastUpdatedAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        onClose={handleLastUpdatedClose}
        disableRestoreFocus
      >
        <Typography>
          {new Date(parseInt(unixTime, 10) * 1000).toString()}
        </Typography>
      </Popover>
    </div>
  );
};

export default TimePopOver;
