import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  textButton: {
    marginRight: theme.spacing(4.5),
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
