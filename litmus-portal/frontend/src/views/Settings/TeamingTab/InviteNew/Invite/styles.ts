import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  Header: {
    fontSize: '2.25rem',
    marginLeft: theme.spacing(-23),
  },
  toolbar: {
    borderBottom: `1px solid ${theme.palette.border.main}`,
    marginBottom: theme.spacing(1.25),
    maxWidth: '31.18rem',
  },
  InviteBtn: {},
  table: {
    maxHeight: '20.1875rem',
    maxWidth: '31.18rem',
  },
  btnFilled: {
    marginRight: theme.spacing(16.75),
    width: '6.93rem',
  },
  avatarBackground: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.text.primary,
    height: '2.56rem',
    marginRight: theme.spacing(2.5),
    width: '2.56rem',
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2.5),
    },
  },
  rowDiv: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  firstCol: {
    alignItems: 'center',
    display: 'flex',
    '& span:first-child': {
      color: theme.palette.common.black,
    },
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
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  text: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3.75),
  },
  email: {
    color: `${theme.palette.text.hint}99`,
  },
  input: {
    '&:-webkit-autofill': {
      webkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
      webkitTextFillColor: theme.palette.text.secondary,
    },
  },
  typo: {
    fontSize: '2.25rem',
  },
  textSecond: {
    height: '1.6875rem',
    marginBottom: theme.spacing(3.75),
    width: '27.5rem',
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
