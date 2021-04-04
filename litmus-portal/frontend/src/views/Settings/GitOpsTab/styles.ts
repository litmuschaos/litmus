import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: theme.spacing(3.75),
  },
  // Upper segment
  headerText: {
    fontSize: '1.5625rem',
    marginBottom: theme.spacing(5),
  },
  mainPrivateRepo: {
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: 4,
    margin: theme.spacing(2.5, 3.75, 2.5, 2),
    padding: theme.spacing(2.5),
    width: 'fit-content',
  },
  privateToggleDiv: {
    display: 'flex',
    flexDirection: 'column',
  },
  mainRadioDiv: {
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: 3,
    padding: theme.spacing(3.125),
  },
  locallyText: {
    fontSize: '1.25rem',
  },
  disconnectText: {
    color: theme.palette.error.main,
    fontSize: '0.875rem',
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(0.625),
  },
  enabledText: {
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: 3,
    display: 'flex',
    marginTop: theme.spacing(2.5),
    padding: theme.spacing(3.125),
  },
  infoText: {
    color: theme.palette.error.main,
    fontSize: '0.75rem',
    marginLeft: theme.spacing(2),
    maxWidth: '25rem',
  },
  gitInfo: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1.5),
  },
  branchText: {
    fontSize: '1rem',
  },
  repoURLText: {
    fontSize: '1rem',
    marginTop: theme.spacing(1.25),
  },
  branch: {
    marginTop: theme.spacing(0.75),
  },
  gitURL: {
    marginTop: theme.spacing(0.75),
  },
  formControl: {
    marginLeft: theme.spacing(3.125),
  },
  sshRadioBtn: {
    marginTop: theme.spacing(1.25),
  },
  checkImg: {
    marginBottom: theme.spacing(2.5),
  },
  sshDiv: {
    backgroundColor: theme.palette.disabledBackground,
    padding: theme.spacing(2.5),
  },
  rowDiv: {
    display: 'flex',
    flexDirection: 'row',
  },
  privateRepoDetails: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(2.5),
  },
  copyBtnImg: {
    paddingRight: '0.625rem',
  },
  done: {
    color: theme.palette.primary.main,
    paddingRight: theme.spacing(0.625),
  },
  alertText: {
    color: theme.palette.common.black,
    fontSize: '0.75rem',
    marginBottom: theme.spacing(2.5),
    opacity: 0.4,
  },
  modalDiv: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    height: '25rem',
    justifyContent: 'center',
  },
  modalHeading: {
    fontSize: '2.25rem',
  },
  submitBtnDiv: {
    marginBottom: theme.spacing(2.5),
    marginTop: theme.spacing(1),
  },
  sshDataDiv: {
    backgroundColor: theme.palette.cards.background,
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'row',
    padding: theme.spacing(2.5),
  },
  sshAlert: {
    color: theme.palette.error.main,
    fontSize: '0.75rem',
  },
  sshText: {
    wordBreak: 'break-all',
  },
  copyBtn: {
    borderLeft: `1px solid ${theme.palette.secondary.main}`,
    margin: 'auto',
    marginLeft: theme.spacing(2.5),
    paddingLeft: theme.spacing(2.5),
  },
  modalDesc: {
    fontSize: '1rem',
    marginBottom: theme.spacing(2.5),
    width: '21.875',
  },
  radio: {
    color: theme.palette.primary.main,
    '&$checked': {
      color: theme.palette.primary.main,
    },
  },
  checked: {},
  createIcon: {
    height: '0.9375rem',
    marginRight: theme.spacing(1),
    width: '0.9375rem',
  },
  editBtn: {
    marginTop: theme.spacing(2.5),
  },
  editText: {
    marginTop: theme.spacing(-0.25),
  },
  editHeader: {
    fontSize: '1.5rem',
    marginBottom: theme.spacing(2.5),
  },
  editDescription: {
    fontSize: '1rem',
    marginBottom: theme.spacing(2.5),
  },
  cancelBtn: {
    marginRight: theme.spacing(2.5),
  },
}));
export default useStyles;
