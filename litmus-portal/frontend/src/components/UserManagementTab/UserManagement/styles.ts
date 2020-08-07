import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  UMDiv: {
    marginTop: theme.spacing(3.75),
    marginLeft: theme.spacing(7.5),
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
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
  table: {
    maxWidth: '63.75rem',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  Signed: {
    minWidth: '2.625rem',
    minHeight: '0.8125rem',
    background: 'rgba(16, 155, 103, 0.1)',
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
    background: 'rgba(202, 44, 44, 0.1)',
    marginRight: theme.spacing(2.5),
    fontSize: '0.625rem',
    padding: theme.spacing(0.834),
    borderRadius: '0.1875rem',
    color: '#CA2C2C',
  },
  toolbar: {
    width: '63.75rem',
    height: '6.125rem',
    border: '1px solid rgba(0,0,0,0.05)',
    marginBottom: theme.spacing(1.25),
  },
  filter: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(5),
  },
  filterMenu: {
    marginLeft: theme.spacing(1.25),
    border: '1px solid rgba(0,0,0,0.05)',
    borderRadius: '0.1875rem',
    minWidth: '11.375rem',
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
    borderRight: '1px solid rgba(0,0,0,0.1)',
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
    borderRight: '1px solid rgba(0,0,0,0.1)',
  },
  opt: {
    background: theme.palette.secondary.contrastText,
  },
  userStat: {
    fontSize: '0.625rem',
    color: theme.palette.text.disabled,
  },
  buttonDiv: {
    marginLeft: theme.spacing(28.875),
  },
  buttonTxt: {},
}));
export default useStyles;
