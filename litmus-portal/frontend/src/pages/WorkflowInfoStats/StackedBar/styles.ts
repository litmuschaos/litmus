import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  stackbarHeader: {
    marginTop: theme.spacing(3),
  },
  date: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: theme.spacing(4, 0),
  },
  divider: {
    width: '84%',
    marginLeft: theme.spacing(10),
    color: theme.palette.border.main,
  },
  stackbarHelperText: {
    marginTop: theme.spacing(3),
    color: theme.palette.text.hint,
  },
  stackbarLegend:{
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row-reverse',
    marginBottom: theme.spacing(3.75),
    paddingRight: theme.spacing(3.5),

    '& img': {
      marginRight: theme.spacing(1.25),
    },

    '& p': {
      color: theme.palette.text.hint,
      marginRight: theme.spacing(1),
    },
  },
}));

export default useStyles;
