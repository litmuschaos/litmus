import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
    background: theme.palette.background.paper,
    padding: theme.spacing(0, 4),
  },

  // CardContent

  card: {
    background: theme.palette.cards.background,
    borderRadius: '3px',
    height: '7.75rem',
    margin: theme.spacing(1),
    cursor: 'pointer',
    border: `1px solid ${theme.palette.border.main}`,
    '&:hover': {
      border: `1px solid ${theme.palette.primary.main}`,
    },
  },

  // CARD MEDIA
  cardMedia: {
    margin: 'auto 0',
    '& img': {
      height: '3.75rem',
      marginLeft: theme.spacing(3),
    },
  },

  meta: {
    margin: theme.spacing(2.5, 0, 2.5, 3),
  },

  // CARD CONTENT
  cardContent: {
    display: 'grid',
    gridTemplateColumns: '0.2fr 0.8fr',
  },

  title: {
    letterSpacing: '0.1142px',
    fontWeight: 500,
    fontSize: '1.125rem',
    lineHeight: '1.375rem',
    textAlign: 'left',
  },

  description: {
    fontSize: '0.75rem',
    lineHeight: '150%',
    textAlign: 'left',
    marginTop: theme.spacing(1),
  },

  noImage: {
    width: '100%',
    height: '5rem',
    backgroundColor: theme.palette.background.paper,
  },

  modal: {
    padding: theme.spacing(3.5, 0, 8.5),
  },

  modalHeading: {
    margin: theme.spacing(4.5, 0, 6.5),
    paddingLeft: theme.spacing(6.5),
    fontSize: '1.5rem',
  },

  closeButton: {
    borderColor: theme.palette.border.main,
    color: theme.palette.border.main,
    padding: theme.spacing(0.5),
    minWidth: '2.5rem',
  },
}));

export default useStyles;
