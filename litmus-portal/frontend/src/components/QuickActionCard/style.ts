import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  quickActionCard: {
    fontSize: '1.125rem',
    backgroundColor: 'inherit',
  },
  listItem: {
    color: theme.palette.text.primary,
    paddingLeft: theme.spacing(2.5),
    paddingBottom: theme.spacing(0.25),
    textDecoration: 'none',
  },
  imgDiv: {
    '& img': {
      userDrag: 'none',
    },
  },
  listItems: {
    marginTop: theme.spacing(2.5),
  },
  mainHeader: {
    fontSize: '1.0625rem',
    color: theme.palette.text.primary,
  },
}));

export default useStyles;
