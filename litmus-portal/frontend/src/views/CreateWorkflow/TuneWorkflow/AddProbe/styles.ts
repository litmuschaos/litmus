import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  buttonDiv: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1.5rem',
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(2.5),
  },
  line: {
    width: '100%',
  },
  closeButton: {
    borderColor: theme.palette.border.main,
    float: 'right',
  },
  detailContainer: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
  },
  form: {
    alignItems: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    justifyContent: 'space-evenly',
    width: '90%',
  },
  formField: {
    alignItems: 'center',
    display: 'flex',
    fontSize: '1rem',
    width: '90%',
    justifyContent: 'space-between',
  },
  delayField: {
    alignItems: 'center',
    display: 'flex',
    fontSize: '1rem',
    width: '50%',
    justifyContent: 'space-between',
  },
  inputFormField: {
    alignItems: 'center',
    display: 'flex',
    fontSize: '1rem',
    width: '80%',
    justifyContent: 'space-between',
    marginLeft: theme.spacing(10),
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
    width: '100%',
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  select: {
    width: '70%',
  },
  inputSelect: {
    width: '50%',
  },
  subHeading: {
    fontSize: '1.5rem',
    marginTop: theme.spacing(2),
    textAlign: 'left',
  },
  inputSub: {
    fontSize: '1.2rem',
    marginTop: theme.spacing(1),
    textAlign: 'left',
  },
  drawer: {
    width: 'fit-content',
    flexShrink: 0,
  },
  drawerPaper: {
    width: 'fit-content',
  },
  required: {
    color: theme.palette.error.main,
  },
}));

export default useStyles;
