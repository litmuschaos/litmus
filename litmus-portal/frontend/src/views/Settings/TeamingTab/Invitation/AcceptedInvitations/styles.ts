import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  table: {
    maxHeight: '20.1875rem',
    marginBottom: theme.spacing(3),
  },
  avatarBackground: {
    backgroundColor: theme.palette.primary.main,
    width: '2.56rem',
    height: '2.56rem',
    color: theme.palette.text.primary,
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
    borderRadius: '0.1875rem',
    color: theme.palette.secondary.dark,
    fontSize: '0.75rem',
    marginLeft: theme.spacing(1.0),
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
    gap: '1rem',
  },
  rootDiv: {
    marginBottom: theme.spacing(2.5),
  },
  root: {
    backgroundColor: theme.palette.cards.background,
    display: 'flex',
    padding: theme.spacing(2.5, 3.75, 2.5, 3.75),
    justifyContent: 'space-between',
  },
  leaveProjectBtn: {
    background: theme.palette.error.main,
    '&:hover': {
      background: theme.palette.error.main,
    },
  },
  userDetails: {},
  name: {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  email: {
    fontSize: '0.75rem',
    color: theme.palette.text.disabled,
  },
  projectDiv: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  projectName: {
    fontSize: '1.125rem',
    fontWeight: 500,
    marginLeft: theme.spacing(1.5),
  },
  avatarDiv: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewProject: {
    marginLeft: theme.spacing(1.5),
    color: theme.palette.primary.main,
  },
}));
export default useStyles;
