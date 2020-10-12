import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    width: '80%',
    margin: '0 auto',
    border: 1,
    borderColor: theme.palette.text.disabled,
    borderRadius: '0.1875rem',
  },
  scHeader: {
    paddingLeft: theme.spacing(3.75),
    paddingRight: theme.spacing(3.75),
    paddingTop: theme.spacing(3.75),
    paddingBottom: theme.spacing(3.75),
  },

  /* styles for upper and lower segment */
  scSegments: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-even',
  },

  headerText: {
    marginTop: theme.spacing(1.25),
    fontSize: '1.5625rem',
  },
  schBody: {
    width: '32.18rem',
  },
  captionText: {
    fontSize: '0.75rem',
    color: theme.palette.text.disabled,
  },
  schLater: {
    marginLeft: theme.spacing(3.75),
  },

  radioText: {
    fontSize: '0.875rem',
  },
  description: {
    width: '32.18rem',
    marginTop: theme.spacing(3.25),
    marginBottom: theme.spacing(7.5),
    fontSize: '1rem',
  },

  calIcon: {
    width: '7rem',
    height: '6.31rem',
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(25),
  },

  scFormControl: {
    marginTop: theme.spacing(5),
  },

  /* For recurring schedule options */
  scRandom: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: theme.spacing(1.625),
    marginBottom: theme.spacing(4.125),
    height: '2.75rem',
    alignItems: 'center',
  },

  formControl: {
    margin: theme.spacing(1),
  },

  /* for option- after sometime */
  wtDateTime: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '19.2rem',
    height: '2.75rem',
    marginTop: theme.spacing(2.125),
    marginBottom: theme.spacing(4.125),
  },

  /* for option- at specific time */
  innerSpecific: {
    marginTop: theme.spacing(2.125),
    marginBottom: theme.spacing(4.125),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  innerRecurring: {
    marginTop: theme.spacing(2.125),
  },

  /* for each options of recurring schedule */
  scRandsub1: {
    margin: theme.spacing(1.875),
    fontSize: '0.75rem',
    color: theme.palette.text.disabled,
  },

  /* for selecting weekdays */
  formControlDT: {
    margin: theme.spacing(1),
    minWidth: '6.6025rem',
    minHeight: '2.75rem',
    '&:select': {
      focusVisible: 'none',
      background: theme.palette.secondary.contrastText,
    },
  },

  /* for selecting date of every month */
  formControlMonth: {
    margin: theme.spacing(1),
    minWidth: '5.3125rem',
    minHeight: '2.75rem',
  },

  /* for each select */
  select: {
    padding: theme.spacing(2.5),
    border: '1px solid #D1D2D7',
    borderRadius: '0.1875rem',
    fontSize: '0.75rem',
    height: '2.75rem',
  },
  /* for each option */
  opt: {
    marginBottom: theme.spacing(1),
    marginLeft: theme.spacing(0.2),
    marginRight: theme.spacing(0.2),
    paddingLeft: theme.spacing(1),
    borderRadius: '0.0625rem',
    '&:hover': {
      background: '#D1D2D7',
    },
  },
}));

export default useStyles;
