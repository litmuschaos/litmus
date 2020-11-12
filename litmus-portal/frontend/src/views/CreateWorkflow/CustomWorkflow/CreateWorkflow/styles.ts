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
  formControlExp: {
    height: '2.5rem',
    minWidth: '9rem',
    backgroundColor: theme.palette.common.white,
    outline: 'none',
  },
  inputExpDiv: {
    height: '2.5rem',
    maxWidth: '15.625rem',
    backgroundColor: theme.palette.common.white,
  },
  expMenu: {
    minWidth: '15.625rem',
    maxHeight: '9.375rem',
    overflow: 'auto',
    zIndex: 2,
    backgroundColor: theme.palette.common.white,
  },
  configureYAML: {
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(2.5),
  },
  radioText: {
    fontSize: '1rem',
  },
  uploadYAMLDiv: {
    width: '39.375rem',
    height: '7.5rem',
    backgroundColor: theme.palette.common.white,
    border: `1px dashed ${theme.palette.common.black}`,
    margin: 'auto',
    marginTop: theme.spacing(5),
    borderRadius: theme.spacing(1.25),
  },
  uploadYAMLText: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '31.25rem',
    margin: 'auto',
    paddingTop: theme.spacing(3.125),
  },
  uploadBtn: {
    textTransform: 'none',
    width: '8.5rem',
    fontSize: '0.9rem',
    height: '2.8125rem',
    border: `2px solid ${theme.palette.secondary.main}`,
    borderRadius: theme.spacing(0.5),
  },
  uploadSuccessDiv: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '31.25rem',
    margin: '0 auto',
    paddingTop: theme.spacing(4.375),
  },
  uploadSuccessImg: {
    width: '3.125rem',
    height: '3.125rem',
    verticalAlign: 'middle',
    paddingBottom: theme.spacing(1),
  },
  uploadSuccessText: {
    display: 'inline-block',
    fontSize: '1rem',
    marginBottom: theme.spacing(1.25),
    marginLeft: theme.spacing(2.5),
  },
}));
export default useStyles;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

export const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

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
