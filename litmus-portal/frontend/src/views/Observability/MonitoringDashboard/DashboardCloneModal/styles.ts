import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  modalHeading: {
    margin: theme.spacing(2.5, 0, 4.5),
    paddingLeft: theme.spacing(6.5),
    fontSize: '1.5rem',
  },

  flexButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(5.5, 6.5, 0, 0),
  },

  modal: {
    padding: theme.spacing(5, 0),
  },

  buttonText: {
    lineHeight: '140%',
    fontSize: '0.875rem',
  },

  okButtonText: {
    color: theme.palette.text.secondary,
    padding: theme.spacing(0, 3),
  },

  cancelButton: {
    marginRight: theme.spacing(1.5),
    padding: theme.spacing(0, 3),
  },
}));

export default useStyles;
