import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    width: '80%',
    margin: '0 auto',
    border: 1,
    borderRadius: 3,
    paddingBottom: theme.spacing(5),
    paddingLeft: theme.spacing(3.125),
    paddingRight: theme.spacing(3.125),
    overflow: 'hidden',
  },

  rootConfigure: {
    height: '100%',
    width: '80%',
    margin: '0 auto',
    border: 1,
    borderRadius: 3,
    paddingTop: theme.spacing(-2),
    paddingBottom: theme.spacing(5),
    paddingLeft: theme.spacing(3.125),
    paddingRight: theme.spacing(3.125),
  },

  icon: {
    width: '6rem',
    height: '6rem',
  },

  button: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(-2),
  },

  config: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(-3),
  },

  cards: {
    background: theme.palette.background.paper,
    height: '80%',
  },

  heading: {
    fontSize: '2rem',
    fontWeight: 500,
  },

  modalHeading: {
    marginTop: theme.spacing(3.5),
    fontSize: '2.25rem',
    marginBottom: theme.spacing(4.5),
  },

  modalBody: {
    marginBottom: theme.spacing(4.5),
  },

  description: {
    width: '90%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(5),
    fontSize: '1rem',
  },

  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(5),
    paddingBottom: theme.spacing(7.5),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },

  closeButton: {
    borderColor: theme.palette.border.main,
  },

  cancelButton: {
    marginLeft: theme.spacing(-2),
  },

  saveButton: {
    marginRight: theme.spacing(-2),
  },

  flexButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
}));

export default useStyles;
