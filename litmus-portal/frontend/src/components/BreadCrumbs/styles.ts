import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  breadCrumb: {
    fontSize: '0.875rem',
    marginBottom: theme.spacing(2),
    '& *': {
      color: theme.palette.text.hint,
      textDecoration: 'none',
    },
  },
  marker: {
    color: theme.palette.text.disabled,
  },
}));

export default useStyles;
