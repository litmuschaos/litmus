import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(7.5),
  },

  // styles for text
  text: {
    width: '31.93rem',
    height: '5.875rem',
    marginTop: theme.spacing(3.75),
    marginBottom: theme.spacing(3.75),
  },
  typo: {
    fontSize: '2rem',
  },
  textSecond: {
    width: '29.06rem',
    height: '1.6875rem',
    marginTop: theme.spacing(1.875),
    marginBottom: theme.spacing(3.75),
  },
  typoSub: {
    fontSize: '1rem',
  },
  // for yes or no buttons
  buttonGroup: {
    display: 'flex',
    width: '12.75rem',
    height: '2.75rem',
    marginTop: theme.spacing(2.5),
    justifyContent: 'space-between',
    gap: '1rem',
  },
  // delete user
  delDiv: {
    maxWidth: '8.56rem',
    display: 'flex',
    marginTop: theme.spacing(3),
    color: '#CA2C2C',
  },
  bin: {
    marginRight: theme.spacing(1.485),
  },
}));
export default useStyles;
