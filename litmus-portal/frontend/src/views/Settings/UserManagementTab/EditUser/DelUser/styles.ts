import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: theme.spacing(7.5),
  },

  // styles for text
  text: {
    height: '5.875rem',
    marginBottom: theme.spacing(3.75),
    marginTop: theme.spacing(3.75),
    width: '31.93rem',
  },
  typo: {
    fontSize: '2rem',
  },
  textSecond: {
    height: '1.6875rem',
    marginBottom: theme.spacing(3.75),
    marginTop: theme.spacing(1.875),
    width: '29.06rem',
  },
  typoSub: {
    fontSize: '1rem',
  },
  // for yes or no buttons
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    height: '2.75rem',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2.5),
    width: '12.75rem',
  },
  // delete user
  delDiv: {
    color: '#CA2C2C',
    display: 'flex',
    marginTop: theme.spacing(3),
    maxWidth: '8.56rem',
  },
  bin: {
    marginRight: theme.spacing(1.485),
  },
}));
export default useStyles;
