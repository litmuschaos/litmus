import { fade, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Upload button styles
  uploadJSONDiv: {
    width: '85%',
    padding: theme.spacing(3.75),
    border: `1px dashed ${theme.palette.border.main}`,
    margin: 'auto',
    marginTop: theme.spacing(1),
    borderRadius: theme.spacing(1.25),
    backgroundColor: theme.palette.cards.header,
  },
  uploadJSONText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '31.25rem',
    margin: 'auto',
    paddingTop: theme.spacing(1),
  },
  uploadImage: {
    marginBottom: theme.spacing(2.5),
  },
  orText: {
    margin: theme.spacing(1.25, 0),
  },
  uploadBtn: {
    textTransform: 'none',
    width: 'fit-content',
    fontSize: '0.7rem',
    height: '2.8125rem',
    border: `2px solid ${theme.palette.primary.light}`,
    borderRadius: '0.25rem',
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
      borderColor: (props) =>
        props !== true ? theme.palette.primary.light : '',
      boxShadow: (props) =>
        props !== true
          ? `${fade(theme.palette.primary.light, 0.5)} 0 0.3rem 0.4rem 0`
          : 'none',
    },
  },
  uploadSuccessDiv: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '31.25rem',
    margin: '0 auto',
    paddingTop: theme.spacing(1.875),
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
    margin: theme.spacing(0, 0, 1.25, 2.5),
  },
}));

export default useStyles;
