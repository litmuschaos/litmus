import { makeStyles, Theme } from '@material-ui/core/styles';

const useQontoStepIconStyles = makeStyles((theme: Theme) => ({
  root: {
    color: theme.palette.primary.light,
    display: 'flex',
    height: theme.spacing(2.5),
    alignItems: 'center',
  },
  active: {
    color: theme.palette.primary.light,
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
  circle: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },
  completed: {
    background: theme.palette.grey[800],
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    borderRadius: '50%',
    zIndex: 1,
    fontSize: theme.spacing(10),
  },
  outerCircle: {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    borderRadius: '50%',
    backgroundColor: theme.palette.grey[400],
  },
  innerCircle: {
    position: 'relative',
    margin: '0 auto',
    marginTop: theme.spacing(0.8),
    width: theme.spacing(1),
    height: theme.spacing(1),
    borderRadius: '50%',
    backgroundColor: theme.palette.common.white,
  },
}));

export default useQontoStepIconStyles;
