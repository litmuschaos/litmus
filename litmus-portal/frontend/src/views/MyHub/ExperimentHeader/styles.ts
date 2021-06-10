import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    maxWidth: '37.5rem',
    display: 'flex',
    flexDirection: 'row',
    fontSize: '1.125rem',
    marginTop: theme.spacing(5),
  },
  expHeader: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    marginBottom: theme.spacing(1),
    color: theme.palette.common.black,
  },
  expDesc: {
    marginBottom: theme.spacing(1),
    color: theme.palette.common.black,
  },
  backBtnImg: {
    height: '1.5625rem',
  },
  expImg: {
    width: '5.625rem',
    height: '5.625rem',
    borderRadius: theme.spacing(1),
  },
  titleDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(2.5),
    width: '21.875rem',
  },
  backButton: {
    marginTop: theme.spacing(1.25),
    marginLeft: theme.spacing(-2),
    width: '3.75rem',
    height: '3.75rem',
  },
}));

export default useStyles;
