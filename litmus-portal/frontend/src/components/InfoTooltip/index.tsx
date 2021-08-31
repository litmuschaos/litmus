import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import IconButton from '@material-ui/core/IconButton';
import { useTheme } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import { Icon } from 'litmus-ui';
import React from 'react';

interface InfoTooltipProps {
  value: string;
  className?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ value, className }) => {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
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
              <Icon name="info" size="lg" color={theme.palette.border.main} />
            </IconButton>
          </Tooltip>
        </div>
      </ClickAwayListener>
    </>
  );
};
export default InfoTooltip;
