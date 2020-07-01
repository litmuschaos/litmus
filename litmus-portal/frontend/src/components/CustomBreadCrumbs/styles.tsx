import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  breadCrumb: {
    fontWeight: 'bold',
    textDecoration: 'none',
    color: theme.palette.text.secondary,
  },
}));

export default useStyles;
