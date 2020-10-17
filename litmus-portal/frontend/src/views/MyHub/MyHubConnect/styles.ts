import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  mainDiv: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    marginTop: theme.spacing(3),
  },
  root: {
    width: 450,
    marginLeft: 'auto',
  },
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    color: theme.palette.text.primary,
    margin: theme.spacing(4.5, 1.5, 2.5, 1.5),
  },
  detailsDiv: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    padding: 40,
  },
  connectText: {
    fontWeight: 400,
    fontSize: '14px',
    marginTop: 10,
  },
  inputDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 20,
    marginLeft: -10,
  },
  inputField: {
    marginBottom: 20,
    width: 400,
  },
  modalDiv: {
    display: 'flex',
    flexDirection: 'column',
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeading: {
    fontWeight: 30,
    fontSize: '36px',
  },
  modalDesc: {
    fontWeight: 400,
    fontSize: '16px',
    width: 350,
    marginBottom: 20,
  },
  videoDescription: {
    marginTop: -50,
    marginLeft: 45,
    width: 300,
    marginBottom: 40,
    fontSize: '16px',
  },
}));

export default useStyles;
