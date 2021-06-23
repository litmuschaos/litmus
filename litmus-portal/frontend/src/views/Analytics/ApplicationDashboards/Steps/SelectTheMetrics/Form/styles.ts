import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.paper,
    height: '100%',
    width: '100%',
    border: 1,
    borderRadius: '3px',
    padding: theme.spacing(0, 4),
  },
  formControlLabel: {
    fontSize: '1rem',
    lineHeight: '140%',
  },
  panelGroupMap: {
    margin: theme.spacing(2.5, 0, 2.5, 1),
  },
  panelGroupName: {
    fontWeight: 500,
    fontSize: '1.125rem',
    lineHeight: '1.375rem',
    letterSpacing: '0.1142px',
    color: theme.palette.text.hint,
  },
  formGroup: {
    flexDirection: 'row',
    gap: '1rem',
    marginTop: theme.spacing(1),
  },
}));

export default useStyles;
