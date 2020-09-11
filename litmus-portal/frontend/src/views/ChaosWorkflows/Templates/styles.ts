import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '90%',
    margin: '0 auto',
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(2.5),
  },
  predefinedCards: {
    display: 'inline-block',
  },
  header: {
    padding: '1rem 0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
  },
  headerSize: {
    fontSize: theme.spacing(2),
  },
}));

// CSS For sort div as well as the icon

/*
  sort: {
    display: 'flex',
    cursor: 'pointer',
  },
  sortIcon: {
    width: theme.spacing(4),
    marginRight: theme.spacing(1),
    position: 'relative',
  },
  line: {
    height: theme.spacing(0.3),
    width: '100%',
    margin: '0.3em 0',
    background: theme.palette.primary.contrastText,
    borderRadius: '0.5rem',
  },
  first: {
    width: '90%',
  },
  second: {
    width: '60%',
  },
  third: {
    width: '30%',
  }, 
*/

export default useStyles;
