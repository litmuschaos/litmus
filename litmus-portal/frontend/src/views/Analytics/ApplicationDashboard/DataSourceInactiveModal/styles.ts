import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  modalHeading: {
    margin: theme.spacing(3.5, 0, 2.5),
    paddingLeft: theme.spacing(6.5),
    fontSize: '1.5rem',
  },

  modalBody: {
    marginBottom: theme.spacing(7.5),
    paddingLeft: theme.spacing(6.5),
    fontSize: '1rem',
  },

  modalBodyText: {
    color: theme.palette.text.hint,
    padding: theme.spacing(1.5, 1.5, 0),
    lineHeight: '140%',
    fontSize: '0.875rem',
  },

  flexButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingRight: theme.spacing(6.5),
  },

  modal: {
    padding: theme.spacing(5, 0),
  },

  closeButton: {
    borderColor: theme.palette.border.main,
  },

  buttonIcon: {
    padding: theme.spacing(0, 1.5, 0, 0.5),
  },

  buttonText: {
    lineHeight: '140%',
    fontSize: '0.875rem',
  },
}));

export default useStyles;
