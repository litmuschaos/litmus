import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  linkPointer: {
    cursor: 'pointer',
  },
  docsButton: {
    '& img': {
      padding: 0,
      margin: theme.spacing(0, 0, 0, 1),
    },
  },
  infoContainerButton: {
    '& img': {
      margin: theme.spacing(0, 1, -0.5, 0),
    },
    '& p': {
      fontWeight: 500,
    },
  },
}));

export default useStyles;
