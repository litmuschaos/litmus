import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  headDiv: {
    marginTop: theme.spacing(3.75),
    marginLeft: theme.spacing(7.5),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3.75),
  },
  createDiv: {
    display: 'flex',
    alignItems: 'stretch',
  },
  divHeaderText: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(0.5),
    fontSize: '1.5625rem',
  },
  descText: {
    fontSize: '1rem',
    marginTop: theme.spacing(2.125),
  },
  backButton: {
    marginLeft: theme.spacing(-2),
  },
  container: {
    marginTop: theme.spacing(3.75),
    border: `1px solid ${theme.palette.border.main}`,
    backgroundColor: theme.palette.cards.background,
    borderRadius: '0.1875rem',
    padding: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
  },

  headerText: {
    marginTop: theme.spacing(7.5),
    fontSize: '1.5625rem',
    marginBottom: theme.spacing(5),
  },
  // for login details
  details1: {
    display: 'flex',
    alignContent: 'flex-start',
    '& div': {
      margin: theme.spacing(0, 1, 1, 0),
      [theme.breakpoints.down('sm')]: {
        width: 'unset',
      },
    },
    flexWrap: 'wrap',
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
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(3.75),
    fontSize: '1rem',
    color: theme.palette.text.disabled,
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
    maxWidth: '11rem',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    color: theme.palette.secondary.dark,
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
