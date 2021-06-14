import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  linkPointer: {
    cursor: 'pointer',
  },
  infoContainerButton: {
    '& svg': {
      margin: theme.spacing(0, 1, -0.625, 0),
    },
    '& p': {
      fontWeight: 500,
    },
  },
}));

export default useStyles;
