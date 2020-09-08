import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  UMDiv: {
    marginTop: theme.spacing(3.75),
    marginLeft: theme.spacing(7.5),
  },
  headerText: {
    fontSize: '1.5625rem',
  },
  root: {
    maxWidth: '63.75rem',
  },
  members: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: theme.spacing(2.625),
    marginBottom: theme.spacing(1.875),
    color: theme.palette.secondary.dark,
  },
  descText: {
    marginBottom: theme.spacing(3.75),
    fontSize: '1rem',
  },
  memTypo: {
    fontSize: '1rem',
  },

  table: {
    maxWidth: '63.75rem',
    height: '30.25rem',
    border: `1px solid ${theme.palette.customColors.black(0.05)}`,
  },
  filterOpt: {
    '&:hover': {
      background: theme.palette.menuOption.active,
    },
  },
  toolbar: {
    maxWidth: '63.75rem',
    height: '6.125rem',
    border: `1px solid ${theme.palette.customColors.black(0.05)}`,
    marginBottom: theme.spacing(1.25),
  },
  filter: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(5),
  },
  filterMenu: {
    marginLeft: theme.spacing(1.25),
    border: `1px solid ${theme.palette.customColors.black(0.05)}`,
    borderRadius: '0.1875rem',

    maxWidth: '11.375rem',
    height: '2.375rem',
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    paddingTop: theme.spacing(0.625),
    paddingBottom: theme.spacing(0.625),
  },
  TR: {
    height: '4.8125rem',
  },
  firstTC: {
    borderRight: `1px solid ${theme.palette.customColors.black(0.1)}`,
    maxWidth: '17.56rem',
  },
  firstCol: {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '17.56rem',
    marginLeft: theme.spacing(3),
  },
  otherTC: {
    maxWidth: '15.375rem',
  },
  styledTC: {
    borderRight: `1px solid ${theme.palette.customColors.black(0.1)}`,
  },
  userRole: {
    fontSize: '0.625rem',
    color: theme.palette.text.disabled,
  },
  toolbarDiv: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toolbarFirstCol: {
    display: 'flex',
  },
  buttonDiv: {
    display: 'flex',
    marginLeft: theme.spacing(25.5),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2),
    },
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(10),
    },
    [theme.breakpoints.down('xs')]: {
      marginLeft: theme.spacing(1),
    },
  },
  optionBtn: {
    marginLeft: 'auto',
  },
  avatarBackground: {
    backgroundColor: theme.palette.secondary.main,
    width: '2.56rem',
    height: '2.56rem',
    color: theme.palette.customColors.white(1),
    alignContent: 'right',
    marginRight: theme.spacing(2.5),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2.5),
    },
  },
  menuHeader: {
    fontSize: '0.75rem',
  },
  menuDesc: {
    fontSize: '0.625rem',
  },
  menuOpt: {
    '&:hover': {
      background: theme.palette.menuOption.active,
    },
  },
  menuDiv: {
    display: 'flex',
    flexDirection: 'column',
  },
  calIcon: {
    marginRight: theme.spacing(1.25),
  },
  dateDiv: {
    display: 'flex',
  },
}));
export default useStyles;
