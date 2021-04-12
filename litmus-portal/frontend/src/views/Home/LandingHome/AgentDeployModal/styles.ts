import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  modalContainer: {
    height: '100%',
    padding: theme.spacing(6.5, 6),
    textAlign: 'left',
  },
  heading: {
    display: 'flex',

    '& img': {
      marginRight: theme.spacing(1.875),
    },

    '& p': {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
  },
  instructionSection: {
    marginTop: theme.spacing(4.25),

    '& p': {
      marginBottom: theme.spacing(4.25),
      color: theme.palette.text.hint,
      fontSize: '1rem',
    },

    '& a': {
      textDecoration: 'none',
      color: theme.palette.primary.main,
      marginLeft: theme.spacing(0.5),
    },
  },
  copyCommandSection: {
    display: 'flex',
  },
  commandRect: {
    border: `1px solid ${theme.palette.border.main}`,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1.75, 2.125),
    flexGrow: 1,
  },
  copyButton: {
    marginLeft: theme.spacing(3.125),

    '& img': {
      marginRight: theme.spacing(1.375),
    },
  },
  doneButton: {
    marginTop: theme.spacing(5),
    display: 'flex',
    flexDirection: 'row-reverse',
  },
}));

export default useStyles;
