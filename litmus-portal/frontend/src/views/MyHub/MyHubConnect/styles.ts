import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  mainDiv: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    marginTop: theme.spacing(3),
  },
  root: {
    minWidth: '28.125rem',
    marginLeft: 'auto',
  },
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    color: theme.palette.text.primary,
    margin: theme.spacing(4.5, 1.5, 2.5, 1.5),
  },
  detailsDiv: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.border.main}`,
    padding: theme.spacing(2.5),
  },
  connectText: {
    fontSize: '0.875rem',
    marginTop: theme.spacing(1.25),
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
  inputField: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2.5),
    width: '20rem',
  },
  inputFieldBranch: {
    marginBottom: theme.spacing(2.5),
    marginRight: theme.spacing(2.5),
    marginLeft: theme.spacing(2.5),
    width: '10rem',
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
  modalDesc: {
    fontSize: '1rem',
    width: '21.875',
    marginBottom: theme.spacing(2.5),
  },
  videoDescription: {
    marginTop: theme.spacing(-6.25),
    marginLeft: theme.spacing(5.625),
    width: '18.75rem',
    marginBottom: theme.spacing(5),
    fontSize: '1rem',
  },
  backBtnDiv: {
    marginLeft: theme.spacing(-1),
    marginBottom: theme.spacing(2.5),
  },
  submitBtnDiv: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2.5),
  },
  enterInfoText: {
    fontSize: '1.5rem',
  },
  checkImg: {
    marginBottom: theme.spacing(2.5),
  },
  quickActionDiv: {
    marginLeft: theme.spacing(5.625),
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
    backgroundColor: theme.palette.disabledBackground,
    padding: theme.spacing(2.5),
  },
  alertText: {
    marginBottom: theme.spacing(2.5),
    fontSize: '0.75rem',
    color: theme.palette.common.black,
    opacity: 0.4,
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
  toggleActive: {
    height: '2.25rem',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.secondary,
    width: '6.25rem',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  toggleInactive: {
    height: '2.25rem',
    backgroundColor: theme.palette.disabledBackground,
    color: theme.palette.text.hint,
    width: '6.25rem',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: theme.palette.disabledBackground,
    },
  },
  toggleFont: {
    fontSize: '0.875rem',
  },
  radio: {
    color: theme.palette.primary.main,
    '&$checked': {
      color: theme.palette.primary.main,
    },
  },
  checked: {},
}));

export default useStyles;
