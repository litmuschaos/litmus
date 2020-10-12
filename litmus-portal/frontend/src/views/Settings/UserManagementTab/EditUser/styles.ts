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
    maxWidth: '63.75rem',
    marginTop: theme.spacing(3.75),
    border: '1px solid ',
    borderColor: theme.palette.customColors.black(0.07),
    backgroundColor: theme.palette.homePageCardBackgroundColor,
    paddingBottom: theme.spacing(5),
  },

  suSegments: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-even',
    marginLeft: theme.spacing(5),
  },
  headerText: {
    marginTop: theme.spacing(7.5),
    fontSize: '1.5625rem',
    marginBottom: theme.spacing(5),
  },
  // for login details
  details1: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
    },
    alignContent: 'flex-start',
    flexWrap: 'wrap',
  },

  divider: {
    marginTop: theme.spacing(3.75),
    maxWidth: '58.75rem',
  },
  buttonGroup: {
    maxWidth: '63.75rem',
    display: 'flex',
    flexDirection: 'row-reverse',
    marginTop: theme.spacing(3.75),
    marginRight: theme.spacing(-4),
  },
}));
export default useStyles;
