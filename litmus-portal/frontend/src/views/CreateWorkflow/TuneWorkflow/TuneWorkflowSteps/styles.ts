import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  showMoreBtn: {
    display: 'flex',
    color: theme.palette.primary.main,
    backgroundColor: 'transparent !important',
    cursor: 'pointer',
    marginBottom: theme.spacing(2.5),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
  btn1: {
    border: 'none !important',
    color: theme.palette.primary.main,
  },
  keyText: {
    fontSize: '1rem',
  },
  addKeyInput: {
    marginRight: theme.spacing(2.25),
  },
  // General Component
  generalContainer: {
    display: 'flex',
    flexDirection: 'column',
  },

  // Target Component
  inputDiv: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '25rem',
  },

  addKeyValue: {
    backgroundColor: 'transparent !important',
    color: theme.palette.primary.main,
    marginTop: theme.spacing(1.25),
    marginBottom: theme.spacing(2.25),
  },

  annotation: {
    fontSize: '0.875rem',
    margin: theme.spacing(0.6, 2, 0, 0),
  },
  annotationInfo: {
    fontSize: '0.875rem',
    maxWidth: '25rem',
  },
  annotationDesc: {
    fontSize: '0.75rem',
    maxWidth: '25rem',
  },
  annotationToggleBtn: {
    width: '4.5rem',
    height: '2.187rem',
  },
  text: {
    textTransform: 'none',
  },

  // Probes Table
  table: {
    marginTop: theme.spacing(2.5),
    minHeight: '9rem',
  },

  // Probes Popover
  probePopOver: {
    marginTop: theme.spacing(1.25),
  },
  popOverDiv: {
    maxWidth: 'fit-content',
    padding: theme.spacing(2.5),
  },
  probeText: {
    fontSize: '1rem',
  },
  deleteIcon: {
    width: '1.25rem',
    height: '1.25rem',
  },
  formControl: {
    margin: theme.spacing(1),
  },

  checkBoxText: {
    fontSize: '0.9rem',
    fontWeight: 400,
  },
  checkBoxDefault: {
    color: theme.palette.primary.main,
  },
  autoCompleteText: {
    width: '100%',
  },
  nodeSelectorText: {
    margin: theme.spacing(1.875, 0.625, 0, 0),
  },
  flexDisplay: {
    display: 'flex',
  },
  appKind: {
    color: theme.palette.text.hint,
  },
  headingDiv: {
    justifyContent: 'space-between',
    display: 'flex',
    alignItems: 'center',
    width: '90%',
  },
  header: {
    fontSize: '1.25rem',
    fontWeight: 500,
  },
  headerDesc: {
    fontSize: '1rem',
    fontWeight: 400,
    color: theme.palette.text.hint,
  },
  tuneDesc: {
    fontSize: '0.875rem',
    color: theme.palette.text.hint,
    width: '90%',
  },
  tunePropDiv: {
    marginTop: theme.spacing(3.75),
    display: 'flex',
    alignItems: 'center',
  },
  tuneHeaderDiv: {
    width: '90%',
    justifyContent: 'space-between',
    display: 'flex',
    alignItems: 'center',
  },
  hrDiv: {
    border: `1px solid ${theme.palette.border.main}`,
    margin: theme.spacing(2.5, 0),
    width: '90%',
  },
  tunePropText: {
    marginRight: theme.spacing(2.5),
    width: '5rem',
  },
  podGCText: {
    marginRight: theme.spacing(2.5),
  },
  podGCSelect: {
    marginTop: theme.spacing(-2),
  },
  saveChangesBtn: {
    marginTop: theme.spacing(5),
  },
  hostName: {
    marginRight: theme.spacing(2.5),
  },
  tuneDiv: {
    marginTop: theme.spacing(2.5),
  },
  tuneName: {
    fontSize: '1rem',
    fontWeight: 500,
  },
}));
export default useStyles;
