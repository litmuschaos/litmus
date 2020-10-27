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
    backgroundColor: theme.palette.common.white,
    border: `1px solid ${theme.palette.customColors.black(0.05)}`,
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
  inputField: {
    marginBottom: theme.spacing(2.5),
    width: '25rem',
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
}));

export default useStyles;
