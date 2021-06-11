import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    flexDirection: 'column',
    color: theme.palette.text.primary,
    marginLeft: theme.spacing(5),
    marginTop: theme.spacing(4),
  },
  detailsDiv: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2.5),
    marginLeft: theme.spacing(2),
  },
  inputDiv: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(2.5),
    marginLeft: theme.spacing(-1.25),
  },
  hubNameInput: {
    marginBottom: theme.spacing(2.5),
    marginLeft: theme.spacing(2),
  },
  backBtnDiv: {
    marginLeft: theme.spacing(-1),
    marginBottom: theme.spacing(2.5),
  },
  rowDiv: {
    display: 'flex',
    flexDirection: 'row',
  },

  copyBtnImg: {
    paddingRight: '0.625rem',
  },
  done: {
    color: theme.palette.primary.main,
    paddingRight: theme.spacing(0.625),
  },
  mainPrivateRepo: {
    border: `1px solid ${theme.palette.border.main}`,
    padding: theme.spacing(2.5),
    margin: theme.spacing(2.5, 3.75, 2.5, 2),
    borderRadius: 4,
    width: 'fit-content',
  },
  privateRepoDiv: {
    width: 'fit-content',
    marginTop: theme.spacing(-6.25),
    padding: theme.spacing(1.25),
    backgroundColor: theme.palette.background.paper,
  },
  inputFieldDiv: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(2.5),
  },
  privateRepoDetails: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(2.5),
  },
  formControl: {
    marginLeft: theme.spacing(3.125),
  },
  sshDiv: {
    backgroundColor: theme.palette.cards.header,
    padding: theme.spacing(2.5),
    maxWidth: '34.375rem',
  },
  alertText: {
    marginBottom: theme.spacing(2.5),
    fontSize: '0.75rem',
    color: theme.palette.common.black,
    opacity: 0.4,
  },
  sshAlert: {
    color: theme.palette.error.main,
    fontSize: '0.75rem',
  },
  sshDataDiv: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: theme.palette.cards.background,
    padding: theme.spacing(2.5),
    borderRadius: 4,
  },
  sshText: {
    wordBreak: 'break-all',
    fontSize: '0.875rem',
  },
  copyBtn: {
    margin: 'auto',
    marginLeft: theme.spacing(2.5),
    borderLeft: `1px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(2.5),
  },
  privateToggleDiv: {
    display: 'flex',
    flexDirection: 'column',
  },
  sshRadioBtn: {
    marginTop: theme.spacing(1.25),
  },

  radio: {
    color: theme.palette.primary.main,
    '&$checked': {
      color: theme.palette.primary.main,
    },
  },
  checked: {},
  drawer: {
    width: 'fit-content',
    flexShrink: 0,
  },
  drawerPaper: {
    width: 'fit-content',
  },
  btnDiv: {
    marginLeft: 'auto',
    marginRight: theme.spacing(3.75),
    marginTop: theme.spacing(2.5),
  },
  cancelBtn: {
    marginRight: theme.spacing(2.5),
  },
}));

export default useStyles;
