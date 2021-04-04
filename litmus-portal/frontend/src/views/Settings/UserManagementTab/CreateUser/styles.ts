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
    borderRadius: '0.1875rem',
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
    '& div': {
      margin: theme.spacing(0, 1, 1, 0),
      [theme.breakpoints.down('sm')]: {
        width: 'unset',
      },
    },
  },

  secondInputField: {
    [theme.breakpoints.down('md')]: {
      margin: theme.spacing(2.5, 0, 0, 0),
    },
    [theme.breakpoints.down('sm')]: {
      width: 'unset',
    },
    marginLeft: theme.spacing(3),
  },

  divider: {
    marginTop: theme.spacing(3.75),
  },

  txt1: {
    color: theme.palette.text.disabled,
    fontSize: '1rem',
    marginBottom: theme.spacing(3.75),
    marginTop: theme.spacing(2.5),
  },

  createRandomButton: {
    background: theme.palette.secondary.dark,
    color: theme.palette.secondary.contrastText,
    height: '2.75rem',
    '&:hover': {
      background: theme.palette.secondary.dark,
    },
  },

  // for copying the credentials
  copyDiv: {
    alignItems: 'stretch',
    color: theme.palette.secondary.dark,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: '11rem',
  },
  copyTypo: {
    marginTop: theme.spacing(1),
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row-reverse',
    marginTop: theme.spacing(3.75),
  },
}));
export default useStyles;
