import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  inputField: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2.5),
    width: '20rem',
  },
  inputFieldBranch: {
    marginBottom: theme.spacing(2.5),
    marginRight: theme.spacing(2.5),
    marginLeft: theme.spacing(2.5),
    width: '10rem',
  },
}));

export default useStyles;
