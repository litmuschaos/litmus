import { fade, makeStyles, TextField, withStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  headerDiv: {
    margin: theme.spacing(4, 0, 2, 1.5),
  },
  headerText: {
    marginTop: theme.spacing(2),
  },
  headerDesc: {
    fontSize: '1rem',
  },
  workflowDiv: {
    width: '95%',
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: theme.palette.common.white,
    border: `1px solid ${theme.palette.customColors.black(0.05)}`,
  },
  inputDiv: {
    display: 'flex',
    flexDirection: 'row',
    margin: theme.spacing(2.5),
    alignItems: 'center',
  },
  resize: {
    fontSize: '0.85rem',
  },
  formControl: {
    height: '2.5rem',
    minWidth: '9rem',
  },
  selectText: {
    height: '2.5rem',
    padding: theme.spacing(0.5),
  },
  selectText1: {
    height: '2.5rem',
    top: theme.spacing(-0.875),
    maxWidth: '5rem',
    fontSize: '0.875rem',
    padding: theme.spacing(0.5),
  },
  nextArrow: {
    marginLeft: theme.spacing(2.5),
  },
  titleText: {
    width: '11.25rem',
  },
  chooseExpDiv: {
    display: 'flex',
    flexDirection: 'row',
  },
  nextButtonDiv: {
    width: '12.5rem',
    marginLeft: 'auto',
    marginTop: theme.spacing(3.75),
    marginBottom: theme.spacing(3.75),
  },
}));
export default useStyles;

export const CustomTextField = withStyles((theme) => ({
  root: {
    borderRadius: theme.spacing(0.5),
    width: '90%',
    border: `1px solid ${theme.palette.input.disabled}`,
    '&:hover': {
      border: `1px solid ${theme.palette.secondary.dark}`,
      boxShadow: `${fade(theme.palette.secondary.dark, 0.5)} 0 0.3rem 0.4rem 0`,
    },
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&$focused': {
      backgroundColor: theme.palette.common.white,
      color: 'inherit',
    },
    paddingLeft: theme.spacing(2),
  },
}))(TextField);
