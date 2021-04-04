import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    flexDirection: 'column',
    height: '100%',
    margin: '0 auto',
    padding: theme.spacing(0, 2),
    width: '98%',
    [theme.breakpoints.up('lg')]: {
      width: '99%',
    },
  },

  // Inner Container
  innerContainer: {
    margin: theme.spacing(4, 'auto'),
    width: '95%', // Inner width of the container
  },

  /* styles for upper and lower segment */
  scSegments: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  headerText: {
    fontSize: '1.5625rem',
    marginTop: theme.spacing(1.25),
  },
  schBody: {
    width: '32.18rem',
  },
  captionText: {
    color: theme.palette.text.disabled,
    fontSize: '0.75rem',
  },
  schLater: {
    marginLeft: theme.spacing(3.75),
  },

  radioText: {
    color: theme.palette.text.primary,
    fontSize: '0.875rem',
  },
  description: {
    fontSize: '1rem',
    marginBottom: theme.spacing(7.5),
    marginTop: theme.spacing(3.25),
    width: '32.18rem',
  },

  calIcon: {
    height: '6.31rem',
    width: '7rem',
  },

  scFormControl: {
    marginTop: theme.spacing(5),
  },

  radio: {
    color: theme.palette.primary.dark,
    '&$checked': {
      color: theme.palette.primary.dark,
    },
  },
  checked: {},

  /* For recurring schedule options */
  scRandom: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    height: '2.75rem',
    marginBottom: theme.spacing(4.125),
    marginLeft: theme.spacing(1.625),
  },

  formControl: {
    margin: theme.spacing(1),
  },

  /* for option- after sometime */
  wtDateTime: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    height: '2.75rem',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(4.125),
    marginTop: theme.spacing(2.125),
    width: '19.2rem',
  },

  /* for option- at specific time */
  innerSpecific: {
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'row',
    marginBottom: theme.spacing(4.125),
    marginTop: theme.spacing(2.125),
  },

  innerRecurring: {
    marginTop: theme.spacing(2.125),
  },

  /* for each options of recurring schedule */
  scRandsub1: {
    color: theme.palette.text.disabled,
    fontSize: '0.75rem',
    margin: theme.spacing(1.875),
  },

  /* for selecting weekdays */
  formControlDT: {
    margin: theme.spacing(1),
    minHeight: '2.75rem',
    minWidth: '6.6025rem',
    '&:select': {
      background: theme.palette.secondary.contrastText,
      focusVisible: 'none',
    },
  },

  /* for selecting date of every month */
  formControlMonth: {
    margin: theme.spacing(1),
    minHeight: '2.75rem',
    minWidth: '5.3125rem',
  },

  /* for each select */
  select: {
    border: '1px solid #D1D2D7',
    borderRadius: '0.1875rem',
    fontSize: '0.75rem',
    height: '2.75rem',
    padding: theme.spacing(2.5),
  },
  /* for each option */
  opt: {
    borderRadius: '0.0625rem',
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(0.2),
    marginRight: theme.spacing(0.2),
    paddingLeft: theme.spacing(1),
    '&:hover': {
      background: '#D1D2D7',
    },
  },
}));

export default useStyles;
