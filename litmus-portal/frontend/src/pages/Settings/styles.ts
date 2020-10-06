import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    color: 'inherit',
    display: 'flex',
    flexGrow: 1,
    maxWidth: '63.75rem',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.customColors.black(0.1)}`,
    backgroundColor: 'inherit',
  },
  Head: {
    margin: theme.spacing(4.5, 1.5, 2.5, 1.5),
  },
}));
export default useStyles;
