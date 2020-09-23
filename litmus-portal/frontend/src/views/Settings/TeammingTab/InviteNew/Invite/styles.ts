import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  Header: {
    fontSize: '2.25rem',

    marginLeft: theme.spacing(-43),
  },
  toolbar: {
    maxWidth: '63.75rem',
    minWidth: '39.0625rem',
    borderBottom: `1px solid ${theme.palette.customColors.black(0.1)}`,
    marginBottom: theme.spacing(1.25),
  },
  InviteBtn: {
    marginRight: theme.spacing(-5),
  },
  table: {
    maxWidth: '63.75rem',
    minWidth: '39.0625rem',
    maxHeight: '20.1875rem',
  },
  avatarBackground: {
    backgroundColor: theme.palette.secondary.main,
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
  menuHeader: {
    fontSize: '0.75rem',
  },
  menuDesc: {
    fontSize: '0.625rem',
  },
  menuOpt: {
    '&:hover': {
      background: theme.palette.customColors.menuOption.active,
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
}));
export default useStyles;
