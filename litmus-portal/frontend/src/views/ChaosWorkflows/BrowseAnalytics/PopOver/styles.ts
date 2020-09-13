import { makeStyles, Theme, withStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  modalContainer: (props: any) => ({
    position: 'absolute',
    width: '197.5px',
    left: props.xLoc !== 0 ? `${props.xLoc + 12.5}px` : '-100px',
    top: `${props.yLoc + 130}px`,
  }),
  root: { borderRadius: '3px' },
  date: {
    background: theme.palette.primary.dark,
    borderRadius: '3px 3px 0px 0px',
    paddingTop: theme.spacing(0.5),
  },
  testDate: {
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    verticalAlign: 'middle',
    display: 'inline-flex',
  },
  testsPassed: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    verticalAlign: 'middle',
    display: 'inline-flex',
  },
  testsFailed: {
    paddingBottom: theme.spacing(1.5),
    verticalAlign: 'middle',
    display: 'inline-flex',
  },
  resilienceScore: {
    paddingTop: theme.spacing(1.5),
    verticalAlign: 'middle',
    display: 'inline-flex',
  },
  miniIcons: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    display: 'block',
  },
}));

export const CustomTypography = withStyles({
  root: {
    color: '#FFFFFF',
  },
})(Typography);

export const WeightedTypography = withStyles({
  root: {
    fontWeight: 500,
  },
})(Typography);

export default useStyles;
