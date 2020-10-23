import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  videoBox: {
    maxWidth: '100%',
    maxHeight: `calc((60vw - 2.5rem) / (16 / 9))`,
  },
  videoDiv: {
    padding: theme.spacing(2),
  },
}));

export default useStyles;
