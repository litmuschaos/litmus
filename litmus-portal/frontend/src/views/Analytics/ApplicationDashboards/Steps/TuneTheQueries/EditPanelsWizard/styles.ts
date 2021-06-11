import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  appBar: {
    background: 'transparent',
    boxShadow: 'none',
    paddingLeft: theme.spacing(1.5),
  },
}));

export default useStyles;
