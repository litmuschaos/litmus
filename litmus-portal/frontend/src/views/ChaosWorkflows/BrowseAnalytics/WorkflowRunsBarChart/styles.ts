import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  plot: {
    width: '160%',
    height: '50rem',
    margin: 'auto',
  },
  waitingText: {
    fontSize: '2rem',
    marginLeft: '25%',
    marginTop: '15%',
    marginBottom: '10%',
  },
  loader: {
    marginLeft: '-8%',
  },
}));

export default useStyles;
