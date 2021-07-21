import { makeStyles } from '@material-ui/core/styles';

// Community Component Styling
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    gridGap: '1rem',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: 'auto',
    gridTemplateAreas: `"feedback slack" 
              "communityEvents communityEvents"`,
    marginRight: theme.spacing(2),
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
    },
  },
  logo: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: '5rem',
    height: '3rem',
    userDrag: 'none',
  },
  joinCard: {
    display: 'flex',
    alignItems: 'center',
    height: '5.3125rem',
    borderRadius: '5px',
    padding: '.4275rem 1.5rem .4275rem 1.5rem',
    justifyContent: 'space-between',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    boxSizing: 'border-box',
    // check
    '&:hover': {
      cursor: 'pointer',
      boxShadow:
        '0px 4px 5px -2px rgb(91 68 186 / 20%), 0px 7px 10px 1px rgb(91 68 186 / 14%), 0px 2px 16px 1px rgb(91 68 186 / 12%)',
    },
  },
  cardTextWithLogo: {
    display: 'flex',
    alignItems: 'center',
  },
  joinCardText: {
    fontStyle: 'normal',
    lineHeight: '150%',
    textAlign: 'left',
    marginLeft: '1.5rem',
    color: theme.palette.text.secondary,
  },
  joinCardTextLarge: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
  },
  joinCardTextMedium: {
    fontWeight: 'bold',
    fontSize: '1.125rem',
  },
  joinCardTextSmall: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },

  slack: {
    background: theme.palette.text.primary,
    gridArea: 'slack',
  },
  dev: {
    background: theme.palette.status.experiment.running,
  },
  feedback: {
    background: theme.palette.primary.main,
    gridArea: 'feedback',
  },
  communityEvents: {
    background: theme.palette.status.experiment.running,
    gridArea: 'communityEvents',
  },
  arrowIcon: {
    height: '0.9375rem',
    width: '0.9375rem',
    fill: 'white',
    filter:
      'invert(98%) sepia(100%) saturate(0%) hue-rotate(86deg) brightness(118%) contrast(119%)',
  },
  secondaryIcons: { height: '3rem', width: '3rem' },
  textImageWrapper: { display: 'flex' },
}));

export default useStyles;
