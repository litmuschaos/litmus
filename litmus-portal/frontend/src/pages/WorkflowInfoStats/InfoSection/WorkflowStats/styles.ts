import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(2.5),
  },

  topDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },

  containerBlock: {
    height: '17.5rem',
    width: '25rem',
    borderRadius: '0.1875rem',
    marginBottom: theme.spacing(1),
    display: 'grid',
    placeContent: 'center',
  },

  cardHeader: {
    height: '100%',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3.125),
  },

  cardText: {
    color: theme.palette.text.primary,
    fontWeight: 500,
    fontSize: '1rem',
  },

  dropDown: {
    marginTop: theme.spacing(-0.3),
    '&:before, &:after': {
      display: 'none',
    },
  },

  radialChart: {
    height: '12rem',
    width: '23rem',
  },

  radialProgressChart: {
    height: '10rem',
    width: '20rem',
    paddingTop: theme.spacing(1.5),
  },

  passedFailedBar: {
    height: '7rem',
    width: '21rem',
  },

  cardBottomText: {
    color: theme.palette.text.hint,
    fontWeight: 400,
    fontSize: '1rem',
    textAlign: 'center',
  },

  cardBottomText1: {
    color: theme.palette.text.hint,
    fontWeight: 400,
    fontSize: '1rem',
    marginTop: theme.spacing(6.5),
  },

  icon: {
    marginRight: theme.spacing(0.875),
  },
}));

export default useStyles;
