import { Theme, withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

const ToolTip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow:
      '0rem 0.128rem 0.384rem rgba(0,0,0,0.1), 0rem 0.682rem 1.54rem rgba(0,0,0,0.13)',
    fontSize: '0.625rem',
    fontWeight: 400,
  },
}))(Tooltip);

export { ToolTip };
