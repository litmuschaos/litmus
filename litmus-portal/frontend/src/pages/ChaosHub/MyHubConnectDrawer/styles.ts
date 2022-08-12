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
  hubName: {
    width: '91%',
  },
  inputDivRemote: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  topMargin: {
    marginTop: theme.spacing(0.5),
  },
  connectHubBtn: {
    padding: theme.spacing(2),
    width: '100%',
    height: '5rem',
    border: 'none',
    boxShadow:
      '0px 0.3px 0.9px rgba(0, 0, 0, 0.1), 0px 1.6px 3.6px rgba(0, 0, 0, 0.13)',
  },
  connectHubIconDiv: {
    display: 'flex',
    alignItems: 'center',
    marginRight: 'auto',
  },
  btnDivRemote: {
    marginLeft: 'auto',
    marginTop: theme.spacing(2.5),
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
    width: '40%',
  },
  btnDiv: {
    marginLeft: 'auto',
    marginRight: theme.spacing(3.75),
    marginTop: theme.spacing(2.5),
  },
  cancelBtn: {
    marginRight: theme.spacing(2.5),
  },
  gitopsIcon: {
    width: '3.125rem',
    height: '3.125rem',
  },
  connectHubText: {
    fontSize: '1.25rem',
    marginLeft: theme.spacing(2.5),
  },
  warningText: {
    color: theme.palette.warning.main,
    marginBottom: theme.spacing(2),
  },
}));

export default useStyles;
