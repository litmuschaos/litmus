import { Theme, withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

const ToolTip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow:
      '0px 2.047px 6.14px rgba(0,0,0,0.1), 0px 10.91px 24.5px rgba(0,0,0,0.13)',
    fontSize: 10,
    fontWeight: 400,
  },
}))(Tooltip);

export { ToolTip };
