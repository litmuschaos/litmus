import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  breadCrumb: {
    fontSize: 12,
    textDecoration: 'none',
    color: theme.palette.text.primary,
  },
}));

export default useStyles;
