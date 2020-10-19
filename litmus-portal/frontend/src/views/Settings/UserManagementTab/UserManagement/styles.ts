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
  Signed: {
    minWidth: '2.625rem',
    minHeight: '0.8125rem',
    background: theme.palette.customColors.menuOption.active,
    marginRight: theme.spacing(2.5),
    borderRadius: '0.1875rem',
    color: theme.palette.primary.dark,
    fontSize: '0.625rem',
    paddingRight: theme.spacing(1.18),
    paddingLeft: theme.spacing(1.18),
    paddingTop: theme.spacing(0.834),
    paddingBottom: theme.spacing(0.834),
  },
  NotSigned: {
    minWidth: '2.625rem',
    minHeight: '0.8125rem',
    background: theme.palette.error.light,
    marginRight: theme.spacing(2.5),
    fontSize: '0.625rem',
    padding: theme.spacing(0.834),
    borderRadius: '0.1875rem',
    color: theme.palette.error.dark,
  },
  toolbar: {
    height: '6.125rem',
    border: `1px solid ${theme.palette.customColors.black(0.05)}`,
    marginBottom: theme.spacing(1.25),
    backgroundColor: theme.palette.homePageCardBackgroundColor,
    display: 'flex',
    justifyContent: 'space-between',
  },
  toolbarFirstCol: {
    display: 'flex',
    alignItems: 'center',
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
  root: {
    backgroundColor: theme.palette.background.paper,
    color: 'inherit',
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
  lastTC: {
    borderLeft: `1px solid ${theme.palette.customColors.black(0.1)}`,
  },
  styledTC: {
    borderRight: `1px solid ${theme.palette.customColors.black(0.1)}`,
  },
  opt: {
    background: theme.palette.secondary.contrastText,
  },
  userStat: {
    fontSize: '0.625rem',
    color: theme.palette.text.disabled,
  },
  optionBtn: {
    marginLeft: 'auto',
  },

  calIcon: {
    marginRight: theme.spacing(1.25),
  },
  dateDiv: {
    display: 'flex',
  },
}));
export default useStyles;
