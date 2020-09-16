import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '20.3125rem',
    height: '14.6875rem',
    marginRight: theme.spacing(3),
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.homePageCardBackgroundColor,
  },
  headerMain: {
    fontWeight: 'bold',
    fontSize: '1rem',
    paddingTop: theme.spacing(3.75),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginLeft: theme.spacing(4),
  },
  progressBox: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing(2.5),
    paddingLeft: theme.spacing(6),
  },
  progressIndicatorDiv: {
    transform: 'rotate(-90deg)',
    marginTop: theme.spacing(-8),
    marginLeft: theme.spacing(-6),
  },
  progressIndicator: {
    color: theme.palette.secondary.dark,
  },
  progressIndicatorCompleterDiv: {
    transform: 'rotate(270deg)',
    marginTop: theme.spacing(-19),
    marginRight: theme.spacing(7),
  },
  progressIndicatorCompleterDivTransformer: {
    transform: 'scaleY(-1)',
  },
  progressIndicatorCompleter: {
    color: theme.palette.grey[400],
  },
  progressLabel: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(-6),
    paddingRight: theme.spacing(-3),
  },
  progressIcon: {
    borderRadius: '50%',
    background: theme.palette.secondary.dark,
    padding: theme.spacing(1),
    height: '2.1875rem',
    width: '2.1875rem',
  },
  progressText: {
    fontSize: '1.5rem',
  },
  testResultDesc: {
    marginLeft: theme.spacing(6),
    marginTop: theme.spacing(-9.5),
    opacity: 0.6,
  },
}));

export default useStyles;
