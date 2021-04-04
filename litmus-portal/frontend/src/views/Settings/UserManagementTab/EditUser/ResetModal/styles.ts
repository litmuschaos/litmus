import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: theme.spacing(7.5),
    padding: theme.spacing(7),
  },
  typo: {
    fontSize: '2rem',
  },
  typoSub: {
    fontSize: '1rem',
  },
  text1Sucess: {
    height: '1.6875rem',
    marginBottom: theme.spacing(3.75),
    width: '27.5rem',
  },
  textSucess: {
    height: '5.875rem',
    marginBottom: theme.spacing(3.75),
    marginTop: theme.spacing(3.75),
    width: '25.06rem',
  },
  textSecondError: {
    height: '1.6875rem',
    margin: '0 auto',
    marginTop: theme.spacing(3.75),
    width: '27.5rem',
  },
  errDiv: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(7, 0),
    textAlign: 'center',
    width: '100%',
  },
  buttonModal: {
    marginTop: theme.spacing(3.75),
  },
  textError: {
    margin: '0 auto',
    marginTop: theme.spacing(13.75),
    width: '20.5rem',
  },
}));
export default useStyles;
