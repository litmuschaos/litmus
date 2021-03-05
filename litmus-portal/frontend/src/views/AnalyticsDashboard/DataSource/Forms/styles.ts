import { Checkbox, makeStyles, withStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.paper,
    height: '100%',
    width: '100%',
    border: 1,
    borderRadius: 3,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(6),
    paddingLeft: theme.spacing(3.125),
    paddingRight: theme.spacing(3.125),
  },

  flexDisplay: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
    paddingRight: theme.spacing(2),
  },

  heading: {
    fontSize: '1.5rem',
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },

  horizontalLine: {
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(2.5),
    background: theme.palette.border.main,
  },

  inputDiv: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
  },

  inputDivLeft: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
  },

  inputDivCheckBox: {
    marginTop: theme.spacing(1),
    width: '60%',
    marginLeft: theme.spacing(2),
  },

  basicAuth: {
    marginLeft: theme.spacing(8),
  },

  withCredentials: {
    marginLeft: theme.spacing(4),
  },

  withCACert: {
    marginLeft: theme.spacing(2),
  },
}));

export const StyledCheckbox = withStyles((theme) => ({
  root: {
    color: theme.palette.text.hint,
  },
  checked: {},
}))(Checkbox);

export default useStyles;
