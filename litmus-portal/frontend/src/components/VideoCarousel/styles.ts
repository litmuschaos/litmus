import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  heading: {
    marginLeft: theme.spacing(5.625),
    fontSize: '16px',
  },
  videoDiv: {
    paddingLeft: theme.spacing(3.75),
  },
}));

export default useStyles;
