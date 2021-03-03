import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  buttonDiv: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1.5rem',
  },
  closeButton: {
    borderColor: theme.palette.border.main,
  },
  detailContainer: {
    display: 'flex',
    width: '100%',
  },
  form: {
    alignItems: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    justifyContent: 'space-evenly',
    marginTop: theme.spacing(2),
    width: '80%',
  },
  formField: {
    alignItems: 'center',
    display: 'flex',
    fontSize: '1rem',
    gap: '1rem',
    justifyContent: 'flex-start',
  },
  formLabel: {
    color: theme.palette.text.hint,
    fontSize: '1rem',
  },
  heading: {
    fontSize: '2rem',
    textAlign: 'left',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
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
  select: {
    width: '50%',
  },
  subHeading: {
    fontSize: '1.5rem',
    marginTop: theme.spacing(2),
    textAlign: 'left',
  },
}));

export default useStyles;
