import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import React from 'react';

const useStyles = makeStyles(() => ({
  infoImg: {
    height: '1.15rem',
    width: '1.15rem',
  },
}));

interface InfoTooltipProps {
  value: string;
  className?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ value, className }) => {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <ClickAwayListener onClickAway={handleTooltipClose}>
        <div className={className}>
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            onClose={handleTooltipClose}
            open={open}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title={value}
            placement="top"
          >
            <IconButton
              aria-label="info icon"
              component="span"
              size="small"
              onClick={handleTooltipOpen}
            >
              <img
                src="./icons/info.svg"
                className={classes.infoImg}
                alt="info tooltip"
              />
            </IconButton>
          </Tooltip>
        </div>
      </ClickAwayListener>
    </>
  );
};
export default InfoTooltip;
