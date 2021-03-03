import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  Header: {
    fontSize: '2.25rem',
    marginLeft: theme.spacing(-23),
  },
  toolbar: {
    maxWidth: '31.18rem',
    borderBottom: `1px solid ${theme.palette.border.main}`,
    marginBottom: theme.spacing(1.25),
  },
  InviteBtn: {},
  table: {
    maxWidth: '31.18rem',
    maxHeight: '20.1875rem',
  },
  btnFilled: {
    width: '6.93rem',
    marginRight: theme.spacing(16.75),
  },
  avatarBackground: {
    backgroundColor: theme.palette.secondary.main,
    width: '2.56rem',
    height: '2.56rem',
    color: theme.palette.text.primary,
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
  menuHeader: {
    fontSize: '0.75rem',
  },
  menuDesc: {
    fontSize: '0.625rem',
  },
  menuOpt: {
    '&:hover': {
      background: theme.palette.success.light,
    },
  },
  optionBtn: {
    marginLeft: 'auto',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  text: {
    marginTop: theme.spacing(3.75),
    marginBottom: theme.spacing(2),
  },
  email: {
    color: `${theme.palette.text.hint}99`,
  },
  input: {
    '&:-webkit-autofill': {
      WebkitTextFillColor: theme.palette.text.secondary,
      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
    },
  },
  typo: {
    fontSize: '2.25rem',
  },
  textSecond: {
    width: '27.5rem',
    height: '1.6875rem',
    marginBottom: theme.spacing(3.75),
  },
  typoSub: {
    fontSize: '1rem',
  },

  // styles for buttons
  button: {
    marginRight: theme.spacing(-2),
  },
  buttonModal: {
    marginTop: theme.spacing(3.75),
  },
  inviteSomeone: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  tableCell: {
    borderBottom: `1px solid  ${theme.palette.border.main}`,
  },
  topBar: {
    borderBottom: `1px solid ${theme.palette.border.main}`,
    marginBottom: -2,
  },
}));
export default useStyles;
