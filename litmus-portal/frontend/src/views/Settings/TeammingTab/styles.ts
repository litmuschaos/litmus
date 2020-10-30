import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  UMDiv: {
    marginTop: theme.spacing(3.75),
  },
  headerText: {
    fontSize: '1.5625rem',
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
  root: {
    backgroundColor: theme.palette.background.paper,
    color: 'inherit',
  },
  table: {
    backgroundColor: 'inherit',
    height: '30.25rem',
    border: `1px solid ${theme.palette.customColors.black(0.05)}`,
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
  toolbar: {
    height: '6.125rem',
    border: `1px solid ${theme.palette.customColors.black(0.05)}`,
    backgroundColor: theme.palette.homePageCardBackgroundColor,
    marginBottom: theme.spacing(1.25),
    display: 'flex',
    justifyContent: 'space-between',
  },
  filter: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(0.5),
    marginLeft: theme.spacing(5),
  },
  formControl: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(6.25),
    minWidth: '9rem',
  },
  selectText: {
    height: '2.5rem',
    padding: theme.spacing(0.5),
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
  toolbarFirstCol: {
    display: 'flex',
    alignItems: 'center',
  },
  buttonDiv: {
    marginRight: theme.spacing(1),
    display: 'flex',
    gap: '1.5rem',
  },
  optionBtn: {
    marginLeft: 'auto',
  },
  avatarBackground: {
    backgroundColor: theme.palette.totalRunsCountColor,
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
      background: theme.palette.customColors.menuOption.active,
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
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(7.5),
  },

  // styles for text
  text: {
    width: '31.93rem',
    height: '5.875rem',
    marginTop: theme.spacing(3.75),
    marginBottom: theme.spacing(3.75),
  },
  typo: {
    fontSize: '2rem',
  },
  textSecond: {
    width: '29.06rem',
    height: '1.6875rem',
    marginTop: theme.spacing(1.875),
    marginBottom: theme.spacing(3.75),
  },
  typoSub: {
    fontSize: '1rem',
  },
  // for yes or no buttons
  buttonGroup: {
    display: 'flex',
    width: '12.75rem',
    height: '2.75rem',
    marginTop: theme.spacing(2.5),
    justifyContent: 'space-between',
  },
}));
export default useStyles;
