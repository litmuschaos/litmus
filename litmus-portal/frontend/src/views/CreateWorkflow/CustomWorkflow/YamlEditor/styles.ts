import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.customColors.white(0.6),
    height: '100%',
    width: '90%',
    marginLeft: theme.spacing(3.75),
    border: 1,
    borderColor: theme.palette.customColors.black(0.05),
    borderRadius: theme.spacing(0.375),
    flexDirection: 'column',
    paddingBottom: theme.spacing(5),
  },
  tuneDiv: {
    padding: theme.spacing(3.75, 3.75, 3.75, 0),
  },
  headerText: {
    marginTop: theme.spacing(2),
  },
  heading: {
    marginTop: theme.spacing(3),
    fontSize: '1.5rem',
  },

  horizontalLine: {
    marginTop: theme.spacing(4),
  },

  editorfix: {
    marginTop: theme.spacing(1),
    width: '95%',
  },
}));

export default useStyles;
