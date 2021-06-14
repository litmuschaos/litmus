import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  rootConfigure: {
    height: '100%',
    width: '100%',
    margin: '0 auto',
    border: 1,
    borderRadius: 3,
    paddingBottom: theme.spacing(5),
  },

  icon: {
    width: '6rem',
    height: '6rem',
  },

  backButton: {
    marginLeft: theme.spacing(-1),
  },

  heading: {
    fontSize: '2rem',
    lineHeight: '2.4375rem',
    marginBottom: theme.spacing(4),
  },

  modal: {
    padding: theme.spacing(15, 0),
  },

  modalHeading: {
    fontSize: '2.25rem',
    margin: theme.spacing(3, 0, 4.5),
  },

  modalBody: {
    marginBottom: theme.spacing(4.5),
  },

  closeButton: {
    borderColor: theme.palette.border.main,
  },

  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: theme.spacing(3, 0, 5),
    paddingBottom: theme.spacing(7.5),
  },

  saveButton: {
    display: 'flex',
  },

  stepText: {
    fontSize: '0.8rem',
    lineHeight: '140%',
    paddingRight: theme.spacing(2.5),
    margin: 'auto auto',
  },

  flexButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
}));

export default useStyles;
