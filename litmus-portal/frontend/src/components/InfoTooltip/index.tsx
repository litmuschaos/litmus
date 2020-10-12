import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  infoImg: {
    height: 15,
    width: 15,
  },
}));

interface InfoTooltipProps {
  value: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ value }) => {
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
        <div>
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
                src="/icons/info.svg"
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
