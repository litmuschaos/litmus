import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  heading: {
    marginLeft: theme.spacing(5.625),
    fontSize: '1rem',
  },
  videoDiv: {
    paddingLeft: theme.spacing(3.75),
    maxWidth: '93%',
  },
  sliderBtn: {
    top: theme.spacing(-18.125),
  },
}));

export default useStyles;
