import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  UMDiv: {
    marginTop: theme.spacing(3.75),
  },
  headerText: {
    fontSize: '1.5625rem',
  },
  members: {
    color: theme.palette.primary.main,
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(1.875),
    marginTop: theme.spacing(2.625),
  },
  descText: {
    fontSize: '1rem',
    marginBottom: theme.spacing(3.75),
  },
  memTypo: {
    fontSize: '1rem',
  },
  table: {
    backgroundColor: 'inherit',
    border: `1px solid ${theme.palette.border.main}`,
    height: '30.25rem',
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
    backgroundColor: theme.palette.cards.background,
    border: `1px solid ${theme.palette.border.main}`,
    display: 'flex',
    height: '6.125rem',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.25),
  },
  toolbarFirstCol: {
    alignItems: 'center',
    display: 'flex',
  },
  filter: {
    alignItems: 'center',
    display: 'flex',
    marginLeft: theme.spacing(5),
    paddingBottom: theme.spacing(0.5),
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
    borderRight: `1px solid ${theme.palette.border.main}`,
    maxWidth: '17.56rem',
  },
  firstCol: {
    alignItems: 'center',
    display: 'flex',
    marginLeft: theme.spacing(3),
    maxWidth: '17.56rem',
  },
  otherTC: {
    maxWidth: '15.375rem',
  },
  lastTC: {
    borderLeft: `1px solid ${theme.palette.border.main}`,
  },
  styledTC: {
    borderRight: `1px solid ${theme.palette.border.main}`,
    paddingLeft: theme.spacing(5.875),
  },
  opt: {
    background: theme.palette.secondary.contrastText,
  },
  userStat: {
    color: theme.palette.text.disabled,
    fontSize: '0.625rem',
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
