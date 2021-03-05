import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(1, 0),
    padding: theme.spacing(4, 1),
    display: 'flex',
    width: '100%',
    height: '100%',
    minWidth: '30rem',
    overflow: 'hidden',
  },

  textSection: {
    height: 'fit-content',
    width: '60%',
    margin: '0 3rem',
    alignSelf: 'center',
  },

  mainHeading: {
    fontSize: '1.4rem',
    lineHeight: '1rem',
    width: '95%',
    display: 'inline-block',
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary,
  },
  subHeading: {
    fontSize: '1.1rem',
    width: '95%',
    display: 'inline-block',
    marginBottom: theme.spacing(2),
    color: theme.palette.warning.main,
  },
  activeGreen: {
    color: theme.palette.highlight,
  },
  description: {
    display: 'inline-block',
    color: theme.palette.text.hint,
    fontSize: '0.9rem',
    maxWidth: '95%',
  },

  predefinedBtn: {
    marginTop: theme.spacing(4.5),
  },
}));

export default useStyles;
