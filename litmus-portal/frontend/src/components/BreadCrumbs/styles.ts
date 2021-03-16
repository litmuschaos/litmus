import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  breadCrumb: {
    fontSize: '0.875rem',
    '& *': {
      color: theme.palette.text.hint,
      textDecoration: 'none',
    },
  },
}));

export default useStyles;
