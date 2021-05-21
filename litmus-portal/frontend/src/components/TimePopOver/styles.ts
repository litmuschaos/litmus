import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
  },
  LastUpdatedPopover: {
    pointerEvents: 'none',
  },
  lastUpdatedText: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

export default useStyles;
