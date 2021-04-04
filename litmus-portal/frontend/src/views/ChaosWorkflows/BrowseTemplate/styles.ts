import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    background: theme.palette.background.paper,
    margin: '0 auto',
    padding: theme.spacing(2),
    width: '90%',
  },
  contentWrapper: {
    background: theme.palette.cards.background,
    padding: theme.spacing(1),
  },
  headerTitle: {
    fontSize: '2rem',
  },
  bodytext: {
    fontSize: '1.0625rem',
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3.25),
  },
  m2: {
    margin: '2rem 0',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  // Head

  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-even',
  },
  headerText: {
    fontSize: '1.5625rem',
    fontWeight: 800,
    marginTop: theme.spacing(1.25),
  },

  body: {
    width: '70%',
  },
  bgIcon: {
    height: '100%',
    margin: '1rem 3rem',
    width: '7rem',
  },
  progress: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: theme.spacing(5),
    width: theme.spacing(79.5),
  },

  // Experiment Details

  experimentWrapperDiv: {
    display: 'grid',
    gridGap: '1.5rem',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    margin: '2rem',
  },
  tests: {
    marginRight: theme.spacing(1),
    width: '17rem',
  },
}));
export default useStyles;
