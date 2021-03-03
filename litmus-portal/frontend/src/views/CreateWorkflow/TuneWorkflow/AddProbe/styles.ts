import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  modal: {
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(10),
    },
    width: '100%',
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  heading: {
    fontSize: '2rem',
    textAlign: 'left',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  subHeading: {
    marginTop: theme.spacing(2),
    textAlign: 'left',
    fontSize: '1.5rem',
  },
  form: {
    width: '80%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'left',
    marginTop: theme.spacing(2),
    gap: '0.5rem',
  },
  formField: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    fontSize: '1rem',
    gap: '1rem',
  },
  formLabel: {
    fontSize: '1rem',
    color: theme.palette.text.hint,
  },
  select: {
    width: '50%',
  },
  closeButton: {
    borderColor: theme.palette.border.main,
  },
  buttonDiv: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1.5rem',
  },
}));

export default useStyles;
