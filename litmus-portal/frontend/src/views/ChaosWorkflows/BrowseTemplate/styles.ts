import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    background: theme.palette.background.paper,
    width: '90%',
    margin: '0 auto',
    padding: theme.spacing(2),
  },
  back: {
    width: '90%',
    margin: '0 auto',
    padding: theme.spacing(1, 0),
  },
  contentWrapper: {
    background: theme.palette.cards.background,
    padding: theme.spacing(1),
  },
  headerTitle: {
    fontSize: '2rem',
  },
  bodytext: {
    marginTop: theme.spacing(3.25),
    marginBottom: theme.spacing(3),
    fontSize: '1.0625rem',
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
    marginTop: theme.spacing(1.25),
    fontSize: '1.5625rem',
    fontWeight: 800,
  },

  body: {
    width: '70%',
  },
  bgIcon: {
    width: '7rem',
    height: '100%',
    margin: '1rem 3rem',
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
    margin: '2rem',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gridGap: '1.5rem',
  },
  tests: {
    width: '17rem',
    marginRight: theme.spacing(1),
  },
}));
export default useStyles;
