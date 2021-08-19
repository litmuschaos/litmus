import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    background: theme.palette.cards.header,
    marginTop: theme.spacing(-5),
  },

  heading: {
    fontWeight: 500,
    fontSize: '1.5rem',
    lineHeight: '1.8125rem',
    padding: theme.spacing(5, 5, 0),
  },

  description: {
    width: '90%',
    margin: theme.spacing(0.5, 0, 2),
    fontSize: '1rem',
    lineHeight: '150%',
    letterSpacing: '0.1176px',
    padding: theme.spacing(1, 5),
  },

  editPanelsWizard: {
    marginBottom: theme.spacing(3),
  },
}));

export default useStyles;
