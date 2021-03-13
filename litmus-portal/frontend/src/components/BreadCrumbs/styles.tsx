import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  breadCrumb: {
    fontSize: 12,
    textDecoration: 'none',
    color: theme.palette.text.primary,
  },
  marker: {
    color: theme.palette.text.disabled,
  },
}));

export default useStyles;
