import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    boxSizing: 'border-box',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
    gap: 0,
    background: theme.palette.background.paper,
    padding: theme.spacing(5),
  },

  // CardContent

  card: {
    background: theme.palette.cards.background,
    width: '11.5rem',
    borderRadius: 3,
    overflow: 'hidden',
    fontSize: '0.875rem',
    margin: theme.spacing(1),
    textAlign: 'center',
    cursor: 'pointer',
    border: `1px solid ${theme.palette.border.main}`,
    boxSizing: 'border-box',
    '&:hover': {
      border: `1px solid ${theme.palette.primary.main}`,
      boxShadow: `0px 4px 4px ${theme.palette.highlight}80`,
    },
  },

  // CARD MEDIA
  cardMedia: {
    width: '100%',
    height: '5rem',
    marginTop: theme.spacing(2),
    background: theme.palette.cards.background,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    '& img': {
      height: '3.75rem',
    },
  },

  // CARD CONTENT
  cardContent: {
    color: theme.palette.text.primary,
  },

  title: {
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: '130%',
    color: theme.palette.text.primary,
  },

  description: {
    textAlign: 'center',
    margin: `0.5rem auto`,
    marginBottom: theme.spacing(4),
    width: '80%',
    color: theme.palette.text.hint,
  },

  noImage: {
    width: '100%',
    height: '5rem',
    backgroundColor: theme.palette.background.paper,
  },
}));

export default useStyles;
