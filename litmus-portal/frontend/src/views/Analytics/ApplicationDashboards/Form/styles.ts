import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.paper,
    height: '100%',
    width: '100%',
    border: 1,
    borderRadius: 3,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(6),
    paddingLeft: theme.spacing(3.125),
    paddingRight: theme.spacing(3.125),
  },

  flexDisplay: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
    paddingRight: theme.spacing(2),
  },

  flexDisplayInformation: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
    paddingRight: theme.spacing(2),
  },

  inputDivInformationHead: {
    width: '25%',
  },

  inputDivInformationContent: {
    width: '85%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },

  panelGroup: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    height: '3rem',
    width: '17rem',
    [theme.breakpoints.down('xl')]: {
      width: '17rem',
    },
    [theme.breakpoints.down('lg')]: {
      width: '15rem',
    },
    [theme.breakpoints.down('md')]: {
      width: '12rem',
    },
  },

  groupPanelBodyText: {
    [theme.breakpoints.down('xl')]: {
      fontSize: '0.9rem',
    },
    [theme.breakpoints.down('lg')]: {
      fontSize: '0.75rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '0.6rem',
    },
  },

  panelGroupHead: {
    marginBottom: theme.spacing(2),
  },

  heading: {
    fontSize: '1.5rem',
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },

  headingHighlighted: {
    fontSize: '1.2rem',
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(1),
    color: theme.palette.highlight,
  },

  panelGroupName: {
    fontSize: '0.95rem',
    color: theme.palette.highlight,
  },

  horizontalLine: {
    marginTop: theme.spacing(3.5),
    marginBottom: theme.spacing(3.5),
    background: theme.palette.border.main,
  },

  inputDiv: {
    width: '26rem',
  },

  inputDivField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
  },

  // Form Select Properties
  formControl: {
    marginTop: theme.spacing(3.5),
    height: '3rem',
    minWidth: '25rem',
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },

  formControlSingle: {
    marginTop: theme.spacing(3),
    height: '3rem',
    minWidth: '25rem',
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },

  selectText: {
    height: '3.25rem',
    padding: theme.spacing(0.5),
    color: theme.palette.text.primary,
  },
}));

export default useStyles;
