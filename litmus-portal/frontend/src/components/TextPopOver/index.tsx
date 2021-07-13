import { Popover, Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface TextPopOverProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

const TextPopOver: React.FC<TextPopOverProps> = ({
  text,
  className,
  style,
}) => {
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
        className={`${classes.text} ${className}`}
        style={style}
      >
        {text}
      </Typography>
      <Popover
        id="mouse-over-popover"
        className={classes.popOver}
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
        <Typography>{text}</Typography>
      </Popover>
    </div>
  );
};

export default TextPopOver;
