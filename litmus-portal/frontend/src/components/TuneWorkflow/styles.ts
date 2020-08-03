import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    height: '100%',
    width: '80%',
    marginLeft: theme.spacing(17.5),
    border: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 3,
    flexDirection: 'column',
    paddingBottom: theme.spacing(5),
  },

  tuneDiv: {
    paddingLeft: theme.spacing(3.75),
    paddingRight: theme.spacing(3.75),
  },

  heading: {
    marginTop: theme.spacing(3),
    fontFamily: 'Ubuntu',
    fontSize: '1.5rem',
    marginLeft: theme.spacing(2),
  },

  description: {
    width: '50rem',
    marginTop: theme.spacing(3),
    fontFamily: 'Ubuntu',
    fontSize: '1rem',
    marginLeft: theme.spacing(2),
  },

  descriptionextended: {
    width: '50rem',
    marginTop: theme.spacing(0),
    fontFamily: 'Ubuntu',
    fontSize: '1rem',
    marginLeft: theme.spacing(2),
  },

  horizontalLine: {
    marginTop: theme.spacing(4),
  },

  editorfix: {
    marginTop: theme.spacing(1),
    width: '100%',
  },
}));

export default useStyles;
