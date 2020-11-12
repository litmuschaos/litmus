import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(2),
  },
  mainDiv: {
    width: '95%',
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(4),
    marginTop: theme.spacing(4),
    border: '0.0625rem solid',
    borderColor: theme.palette.customColors.black(0.07),
    backgroundColor: theme.palette.common.white,
    borderRadius: '0.1875rem',
    paddingBottom: theme.spacing(4),
  },
  detailsDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(5),
    marginTop: theme.spacing(5),
  },
  firstCol: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: theme.spacing(12),
    justifyContent: 'space-between',
  },
  backBotton: {
    paddingTop: theme.spacing(5),
    marginLeft: theme.spacing(2),
  },

  version: {
    marginTop: theme.spacing(2),
  },
  aboutDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(5),
    marginTop: theme.spacing(4),
  },
  linkBox: {
    backgroundColor: theme.palette.common.white,
    paddingRight: theme.spacing(9),
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    wordWrap: 'break-word',
    justifyContent: 'space-between',
  },
  status: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  expDiv: {
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
  },
  btnImg: {
    width: '0.8125rem',
    height: '0.8125rem',
    marginTop: theme.spacing(0.375),
  },
  btnText: {
    paddingLeft: theme.spacing(1.625),
  },
  rightMargin: {
    marginRight: theme.spacing(8),
  },
  buttonBox: {
    display: 'flex',
    paddingLeft: theme.spacing(4),
  },
  connectdevice: {
    fontSize: '1rem',
    lineHeight: '175%',
    fontWeight: 'bold',
    color: theme.palette.common.black,
  },
  stepsDiv: {
    marginLeft: theme.spacing(8),
    marginTop: theme.spacing(2),
    width: '50rem',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  check: {
    width: '5.9125rem',
    textAlign: 'center',
    borderRadius: 3,
    paddingTop: theme.spacing(0.375),
    paddingBottom: theme.spacing(0.375),
    color: theme.palette.primary.dark,
  },
  active: {
    color: theme.palette.primary.dark,
    background: theme.palette.customColors.menuOption.active,
  },
  notactive: {
    color: theme.palette.error.dark,
    backgroundColor: theme.palette.error.light,
  },
  pending: {
    background: theme.palette.customColors.menuOption.pending,
    color: theme.palette.warning.main,
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
    gap: '1rem',
    marginTop: theme.spacing(2.5),
    justifyContent: 'space-between',
  },
}));

export default useStyles;
