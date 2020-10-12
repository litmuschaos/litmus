import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
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
    background: theme.palette.sectionDividerColor,
    height: '0.2rem',
  },
  heightMaintainer: {
    lineHeight: '2rem',
  },
}));

export default useStyles;
