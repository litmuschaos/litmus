import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  icon: {
    width: '6rem',
    height: '6rem',
  },

  modalHeading: {
    margin: theme.spacing(3.5, 0, 4.5),
    fontSize: '2.25rem',
  },

  modalBody: {
    marginBottom: theme.spacing(4.5),
  },

  flexButtons: {
    display: 'flex',
    justifyContent: 'space-evenly',
  },

  modal: {
    padding: theme.spacing(15, 0),
  },
}));

export default useStyles;
