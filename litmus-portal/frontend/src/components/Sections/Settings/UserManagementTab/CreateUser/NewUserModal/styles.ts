import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(14),
  },
  // styles for text
  text: {
    width: '23.5rem',
    height: '5.875rem',
    marginTop: theme.spacing(3.75),
    marginBottom: theme.spacing(3.75),
  },
  typo: {
    fontSize: '2.25rem',
  },
  textSecond: {
    width: '27.5rem',
    height: '1.6875rem',
    marginBottom: theme.spacing(3.75),
  },
  typoSub: {
    fontSize: '1rem',
  },

  // styles for buttons
  button: {
    marginRight: theme.spacing(-2),
  },
  buttonModal: {
    marginTop: theme.spacing(3.75),
  },
  copyDiv: {
    marginTop: theme.spacing(6),
    flexDirection: 'row',
    width: '10.0625rem',
    display: 'flex',
    justifyContent: 'space-between',
    color: theme.palette.secondary.dark,
  },
}));
export default useStyles;
