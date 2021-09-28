import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.paper,
    padding: theme.spacing(5, 2.5, 0),
  },
  appBar: {
    background: 'transparent',
    boxShadow: 'none',
    paddingLeft: theme.spacing(1.5),
  },
  icon: {
    margin: theme.spacing(0, 1),
    width: '1.25rem',
  },
  iconButton: {
    minWidth: 0,
    background: 'transparent',
    padding: theme.spacing(0.25, 0.5),
  },
  deleteButton: {
    borderColor: theme.palette.error.main,
  },
  queryCount: {
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: '140%',
    textAlign: 'center',
    color: theme.palette.text.hint,
  },
  editSection: {
    paddingTop: theme.spacing(3),
  },
  avatar: {
    width: '1.75rem',
    height: '1.75rem',
    marginLeft: theme.spacing(1.5),
    background: theme.palette.cards.header,
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: theme.spacing(0, 2),
  },
  topMargin: {
    marginTop: theme.spacing(2),
  },
  flexEnd: {
    justifyContent: 'flex-end',
  },
  switches: {
    display: 'flex',
    gap: '3.375rem',
    padding: theme.spacing(5, 0),
  },
  divider: {
    fontWeight: 500,
    fontSize: '1.125rem',
    lineHeight: '1.375rem',
    letterSpacing: '0.1142px',
    color: theme.palette.text.hint,
    padding: theme.spacing(0, 1),
  },
  flex: {
    display: 'flex',
  },
  controlButtons: {
    marginTop: theme.spacing(-1.5),
  },
  header: {
    padding: theme.spacing(1, 2, 4),
  },

  // modal
  modalHeading: {
    fontSize: '1.5rem',
    lineHeight: '130%',
    fontFeatureSettings: `'pnum' on, 'lnum' on`,
    margin: theme.spacing(2.5, 0, 4.5),
    padding: theme.spacing(0, 6.5),
  },
  modalBodyText: {
    fontSize: '1rem',
    lineHeight: '130%',
    padding: theme.spacing(0, 6.5),
  },
  flexButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: theme.spacing(5.5, 6.5, 0, 0),
  },
  modal: {
    padding: theme.spacing(5, 0),
  },
  buttonText: {
    lineHeight: '140%',
    fontSize: '0.875rem',
  },
  confirmButtonText: {
    color: theme.palette.text.secondary,
    padding: theme.spacing(0, 3),
  },
  cancelButton: {
    marginRight: theme.spacing(1.5),
    padding: theme.spacing(0, 3),
  },
}));

export default useStyles;
