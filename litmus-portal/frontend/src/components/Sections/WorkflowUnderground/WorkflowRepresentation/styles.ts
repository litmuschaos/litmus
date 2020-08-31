import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '25%',
    padding: '1rem 2rem',
    marginTop: '1rem',
  },
  header: {
    color: theme.palette.secondary.dark,
  },
  bold: {
    fontWeight: 500,
  },
  workflowSpacing: {
    margin: '1rem 0',
  },
  divider: {
    background: theme.palette.secondary.dark,
    height: '0.2rem',
  },
  heightMaintainer: {
    lineHeight: '2rem',
  },
}));

export default useStyles;
