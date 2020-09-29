import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    marginTop: '1rem',
  },
  bold: {
    fontWeight: 500,
  },
  header: {
    color: theme.palette.secondary.dark,
  },
  nodeSpacing: {
    margin: '1rem 0',
  },
  heightMaintainer: {
    lineHeight: '2rem',
  },
}));

export default useStyles;
