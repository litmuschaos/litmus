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
    padding: theme.spacing(2.5),
    margin: theme.spacing(2.5, 3.75, 2.5, 2),
    borderRadius: 4,
    width: 'fit-content',
  },
  privateToggleDiv: {
    display: 'flex',
    flexDirection: 'column',
  },
  mainRadioDiv: {
    padding: theme.spacing(3.125),
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: 3,
  },
  locallyText: {
    fontSize: '1.25rem',
  },
  disconnectText: {
    fontSize: '0.875rem',
    color: theme.palette.error.main,
    marginTop: theme.spacing(0.625),
    marginBottom: theme.spacing(1),
  },
  enabledText: {
    padding: theme.spacing(3.125),
    border: `1px solid ${theme.palette.border.main}`,
    marginTop: theme.spacing(2.5),
    display: 'flex',
    borderRadius: 3,
  },
  infoText: {
    maxWidth: '25rem',
    color: theme.palette.error.main,
    fontSize: '0.75rem',
    marginLeft: theme.spacing(2),
  },
  gitInfo: {
    marginTop: theme.spacing(1.5),
    marginLeft: theme.spacing(2),
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
    marginBottom: theme.spacing(2.5),
    fontSize: '0.75rem',
    color: theme.palette.common.black,
    opacity: 0.4,
  },
  modalDiv: {
    display: 'flex',
    flexDirection: 'column',
    height: '25rem',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeading: {
    fontSize: '2.25rem',
  },
  submitBtnDiv: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2.5),
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
  },
  copyBtn: {
    margin: 'auto',
    marginLeft: theme.spacing(2.5),
    borderLeft: `1px solid ${theme.palette.secondary.main}`,
    paddingLeft: theme.spacing(2.5),
  },
  modalDesc: {
    fontSize: '1rem',
    width: '21.875',
    marginBottom: theme.spacing(2.5),
  },
  radio: {
    color: theme.palette.primary.main,
    '&$checked': {
      color: theme.palette.primary.main,
    },
  },
  checked: {},
  createIcon: {
    width: '0.9375rem',
    height: '0.9375rem',
    marginRight: theme.spacing(1),
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
