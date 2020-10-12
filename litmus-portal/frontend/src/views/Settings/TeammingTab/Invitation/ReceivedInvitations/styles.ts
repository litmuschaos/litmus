import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  table: {
    maxHeight: '20.1875rem',
    marginBottom: theme.spacing(3),
  },
  avatarBackground: {
    backgroundColor: theme.palette.totalRunsCountColor,
    width: '2.56rem',
    height: '2.56rem',
    color: theme.palette.customColors.white(1),
    marginRight: theme.spacing(2.5),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2.5),
    },
  },
  nameRole: {
    display: 'flex',
    justifyContent: 'center',
  },
  role: {
    marginLeft: theme.spacing(1.0),
    borderRadius: '0.1875rem',
    fontSize: '0.75rem',
    color: theme.palette.secondary.dark,
  },
  rowDiv: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  firstCol: {
    display: 'flex',
  },
  detail: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(0.5),
  },
  buttonDiv: {
    display: 'flex',
  },
}));
export default useStyles;
