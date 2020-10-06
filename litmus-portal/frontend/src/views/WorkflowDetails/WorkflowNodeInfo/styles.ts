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
  footerButton: {
    marginLeft: 'auto',
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(3, 4, 4, 0),
  },
}));

export default useStyles;
