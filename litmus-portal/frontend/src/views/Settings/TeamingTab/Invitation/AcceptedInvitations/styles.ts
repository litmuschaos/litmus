import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  table: {
    marginBottom: theme.spacing(3),
    maxHeight: '20.1875rem',
  },
  avatarBackground: {
    backgroundColor: theme.palette.primary.main,
    height: '2.56rem',
    marginRight: theme.spacing(2.5),
    width: '2.56rem',
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
    justifyContent: 'space-between',
    padding: theme.spacing(2.5, 3.75, 2.5, 3.75),
  },
  leaveProjectBtn: {
    background: theme.palette.error.main,
    '&:hover': {
      background: theme.palette.error.main,
    },
  },
  name: {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  email: {
    color: theme.palette.text.disabled,
    fontSize: '0.75rem',
  },
  projectDiv: {
    alignItems: 'center',
    display: 'flex',
  },
  projectName: {
    fontSize: '1.125rem',
    fontWeight: 500,
  },
  projectRole: {
    alignItems: 'center',
    color: theme.palette.text.hint,
    display: 'flex',
    fontSize: '0.875rem',
  },
  avatarDiv: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  viewProject: {
    color: theme.palette.primary.main,
    marginLeft: theme.spacing(1.5),
  },
}));
export default useStyles;
