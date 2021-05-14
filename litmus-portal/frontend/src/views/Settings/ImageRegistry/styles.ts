import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: theme.spacing(3.75),
  },
  mainRadioDiv: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(3.125),
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: 3,
  },
  radio: {
    color: theme.palette.primary.main,
    '&$checked': {
      color: theme.palette.primary.main,
    },
  },
  checked: {},
  defaultText: {
    fontSize: '1.25rem',
  },
  headerText: {
    fontSize: '1.625rem',
    fontWeight: 500,
  },
  headerDesc: {
    fontSize: '1rem',
    fontWeight: 400,
    marginTop: theme.spacing(1.875),
  },
  defaultTextDesc: {
    fontSize: '0.875rem',
    marginTop: theme.spacing(1.875),
  },
  registryInfoDiv: {
    marginTop: theme.spacing(2.5),
    display: 'flex',
    justifyContent: 'space-between',
    width: '46.15rem',
  },
  registryInfoText: {
    fontSize: '1rem',
  },
  defaultBtn: {
    marginTop: theme.spacing(2.5),
  },
  customDiv: {
    marginTop: theme.spacing(2.5),
    display: 'flex',
  },
  inputDiv: {
    marginRight: theme.spacing(5),
  },
  formControl: {
    margin: theme.spacing(2.5, 0, 2.5, 0),
    width: '12.5rem',
  },
  labelText: {
    color: theme.palette.common.black,
  },
  additionalDetails: {
    fontSize: '1rem',
    marginTop: theme.spacing(2.5),
    marginRight: theme.spacing(1),
  },
  infoText: {
    padding: theme.spacing(2),
    width: '15.625rem',
  },
  iconBtn: {
    marginTop: theme.spacing(1.25),
  },
}));
export default useStyles;
