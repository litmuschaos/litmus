import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    alignItems: 'center',
    background: theme.palette.background.paper,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    justifyContent: 'flex-start',
    padding: theme.spacing(5),
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
  },

  // CardContent

  card: {
    background: theme.palette.cards.background,
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: 3,
    boxSizing: 'border-box',
    cursor: 'pointer',
    fontSize: '0.875rem',
    margin: theme.spacing(1),
    overflow: 'hidden',
    textAlign: 'center',
    width: '11.5rem',
    '&:hover': {
      border: `1px solid ${theme.palette.primary.main}`,
      boxShadow: `0px 4px 4px ${theme.palette.highlight}80`,
    },
  },

  // CARD MEDIA
  cardMedia: {
    alignItems: 'center',
    background: theme.palette.cards.background,
    display: 'flex',
    flexDirection: 'row',
    height: '5rem',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    width: '100%',
    '& img': {
      height: '3.75rem',
    },
  },

  // CARD CONTENT
  cardContent: {
    color: theme.palette.text.primary,
  },

  title: {
    color: theme.palette.text.primary,
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: '130%',
  },

  description: {
    color: theme.palette.text.hint,
    margin: `0.5rem auto`,
    marginBottom: theme.spacing(4),
    textAlign: 'center',
    width: '80%',
  },

  noImage: {
    backgroundColor: theme.palette.background.paper,
    height: '5rem',
    width: '100%',
  },
}));

export default useStyles;
