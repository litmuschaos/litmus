import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  // drawer
  drawer: {
    width: 'fit-content',
    flexShrink: 0,
  },
  drawerPaper: {
    width: '100%',
    background: 'rgba(0, 0, 0, 0.6)',
  },
  drawerContent: {
    height: '100%',
    width: '50%',
    marginLeft: '50%',
    background: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(10, 6.5),
  },
  closeButton: {
    borderColor: theme.palette.border.main,
    color: theme.palette.border.main,
    padding: theme.spacing(0.25, 2),
    minWidth: 0,
  },
  flexContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  drawerHeading: {
    fontSize: '1.5rem',
    lineHeight: '130%',
    fontFeatureSettings: `'pnum' on, 'lnum' on`,
  },
  flexButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 'auto',
  },
  cancelButton: {
    width: 'fit-content',
    marginRight: theme.spacing(1.5),
    padding: theme.spacing(0, 3),
  },
  buttonText: {
    lineHeight: '140%',
    fontSize: '0.875rem',
  },
  confirmButtonText: {
    color: theme.palette.text.secondary,
    padding: theme.spacing(0, 1.5),
  },
  editors: {
    overflowY: 'auto',
    margin: theme.spacing(4, 0),
  },
}));

export default useStyles;
