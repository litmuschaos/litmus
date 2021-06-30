import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(2.5),
  },

  topDiv: {
    display: 'flex',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
  },

  containerBlock: {
    height: '17.5rem',
    width: '25.06rem',
    borderRadius: '0.1875rem',
    padding: theme.spacing(3.6, 2.8, 6.7, 4.0),
    marginBottom: theme.spacing(1),
  },

  cardText: {
    display: 'flex',
    justifyContent: 'space-between',
    color: theme.palette.text.primary,
    fontWeight: 500,
    fontSize: '1rem',
    marginBottom: theme.spacing(3.125),
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
    height: '9rem',
    width: '20rem',
  },

  passedFailedBar: {
    height: '7rem',
    width: '21rem',
  },

  cardBottomText: {
    color: theme.palette.text.hint,
    fontWeight: 400,
    fontSize: '1rem',
    marginTop: theme.spacing(3.125),
    marginLeft: theme.spacing(5.5),
  },

  cardBottomText1: {
    color: theme.palette.text.hint,
    fontWeight: 400,
    fontSize: '1rem',
    marginTop: theme.spacing(6.5),
  },

  button: {
    backgroundColor: '#E5E7F1',
    width: '100%',
    border: 'none',
  },

  icon: {
    marginRight: theme.spacing(0.875),
  },
}));

export default useStyles;
