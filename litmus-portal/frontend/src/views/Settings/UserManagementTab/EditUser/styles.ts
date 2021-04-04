import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  headDiv: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3.75),
    marginLeft: theme.spacing(7.5),
    marginTop: theme.spacing(3.75),
  },
  createDiv: {
    alignItems: 'stretch',
    display: 'flex',
  },
  divHeaderText: {
    fontSize: '1.5625rem',
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(0.5),
  },
  descText: {
    fontSize: '1rem',
    marginTop: theme.spacing(2.125),
  },
  backButton: {
    marginLeft: theme.spacing(-2),
  },
  container: {
    backgroundColor: theme.palette.cards.background,
    border: `1px solid ${theme.palette.border.main}`,
    marginTop: theme.spacing(3.75),
    padding: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  headerText: {
    fontSize: '1.5625rem',
    marginBottom: theme.spacing(5),
    marginTop: theme.spacing(7.5),
  },
  // for login details
  details1: {
    alignContent: 'flex-start',
    display: 'flex',
    flexWrap: 'wrap',
  },

  divider: {
    marginTop: theme.spacing(3.75),
    maxWidth: '58.75rem',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row-reverse',
    marginTop: theme.spacing(3.75),
  },
}));
export default useStyles;
