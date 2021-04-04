import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: 'inherit',
    borderBottom: `1px solid ${theme.palette.border.main}`,
    '& button': {
      width: '100%',
    },
  },
  Head: {
    marginBottom: theme.spacing(2.5),
  },
}));
export default useStyles;
