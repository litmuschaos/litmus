import { makeStyles } from '@material-ui/core/styles';

// Component styles
const useStyles = makeStyles((theme) => ({
  rootContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflowX: 'hidden',
  },

  root: {
    marginBottom: theme.spacing(8),
    marginLeft: theme.spacing(6),
    marginTop: theme.spacing(5),
  },

  headerDiv: {
    backgroundColor: theme.palette.disabledBackground,
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(5),
    minHeight: '5rem',
  },

  italic: {
    fontStyle: 'italic',
  },

  dashboardType: {
    fontSize: '1.5rem',
    marginLeft: theme.spacing(5),
    marginTop: theme.spacing(3),
  },

  loaderText: {
    marginBottom: '3%',
    textAlign: 'center',
  },

  analyticsDiv: {
    backgroundColor: theme.palette.background.paper,
    minHeight: '26rem',
    paddingTop: theme.spacing(2),
  },

  button: {
    marginBottom: theme.spacing(3),
    marginLeft: theme.spacing(-2),
  },

  iconButton: {
    height: '3rem',
    marginLeft: theme.spacing(1.5),
    width: '3rem',
  },

  dashboardSwitchIcon: {
    height: '2rem',
    width: '2rem',
  },

  weightedFont: {
    fontWeight: 500,
  },

  // Menu option
  menuItem: {
    '&:hover': {
      background: theme.palette.primary.light,
      color: theme.palette.secondary.contrastText,
    },
    height: '2.5rem',
    minWidth: '10rem',
  },

  expDiv: {
    display: 'flex',
    flexDirection: 'row',
  },

  btnText: {
    fontWeight: 500,
  },

  icon: {
    height: '6rem',
    width: '6rem',
  },

  modalHeading: {
    fontSize: '2.25rem',
    marginBottom: theme.spacing(4.5),
    marginTop: theme.spacing(3.5),
  },

  modalBody: {
    marginBottom: theme.spacing(4.5),
  },

  flexButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },

  loader: {
    padding: '22%',
  },

  modal: {
    padding: theme.spacing(15, 0),
  },
}));

export default useStyles;
