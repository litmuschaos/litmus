import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  table: {
    maxHeight: '20.1875rem',
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

  pending: {
    minWidth: '2.625rem',
    background: theme.palette.customColors.menuOption.active,
    marginLeft: theme.spacing(1.0),
    borderRadius: '0.1875rem',
    color: theme.palette.primary.dark,
    fontSize: '0.625rem',

    paddingRight: theme.spacing(0.5),
    paddingLeft: theme.spacing(0.5),
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
  },
  declined: {
    minWidth: '2.625rem',
    marginLeft: theme.spacing(1.0),
    borderRadius: '0.1875rem',
    fontSize: '0.625rem',
    paddingRight: theme.spacing(0.5),
    paddingLeft: theme.spacing(0.5),
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    color: theme.palette.error.dark,
    background: theme.palette.error.light,
  },

  flexstatus: {
    display: 'flex',
    justifyContent: 'center',
  },
}));
export default useStyles;
