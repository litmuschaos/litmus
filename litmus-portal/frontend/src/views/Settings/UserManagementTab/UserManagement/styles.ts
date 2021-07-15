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
    color: theme.palette.primary.main,
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
    border: `1px solid ${theme.palette.border.main}`,
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
    border: `1px solid ${theme.palette.border.main}`,
    marginBottom: theme.spacing(1.25),
    backgroundColor: theme.palette.cards.background,
    display: 'flex',
    justifyContent: 'space-between',
  },
  toolbarFirstCol: {
    display: 'flex',
    alignItems: 'center',
  },
  toolbarSecondCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
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
    borderRight: `1px solid ${theme.palette.border.main}`,
    maxWidth: '8.5rem',
  },
  firstCol: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(3),
    '& svg': {
      width: '3.75rem',
    },

    '& circle': {
      r: '0.5',
      cx: '2.5',
      cy: '2.5',
    },
  },
  tableHeader: {
    color: theme.palette.text.hint,
  },
  tooltip: {
    boxShadow: `0 5px 10px rgb(0 0 0 / 30%)`,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  statusActive: {
    fill: theme.palette.secondary.dark,
  },
  statusDeactivated: {
    fill: theme.palette.disabledBackground,
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
