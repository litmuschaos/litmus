import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  rootPanel: {
    display: 'inline-block',
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
    margin: theme.spacing(1.5, 0, 1),
  },

  rootPanelGroup: {
    width: '100%',
    display: 'inline-block',
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
    paddingBottom: 0,
    marginBottom: theme.spacing(1),
  },

  panelGroup: {
    display: 'flex',
    alignContent: 'left',
    background: theme.palette.disabledBackground,
  },

  panelGroupContainer: {
    position: 'relative',
    width: '100%',
    background: theme.palette.cards.header,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridGap: theme.spacing(1.75),
    padding: theme.spacing(1, 1, 1, 1.75),
  },

  expand: {
    gridColumnStart: 1,
    gridColumnEnd: 3,
  },

  panelGroupTitle: {
    fontWeight: 700,
    fontSize: '1rem',
  },

  title: {
    fontWeight: 700,
    fontSize: '0.9rem',
    color: theme.palette.text.primary,
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
    paddingTop: theme.spacing(2),
  },

  singleGraph: {
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    width: 'inherit',
    height: '27.5rem',
  },

  popOutModal: {
    width: '85%',
    height: '95%',
    padding: theme.spacing(4),
  },

  wrapperParentIconsTitle: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  wrapperIcons: {
    display: 'flex',
  },

  panelIcon: {
    width: '0.9rem',
    height: '0.9rem',
  },

  panelIconButton: {
    backgroundColor: 'transparent !important',
    cursor: 'pointer',
    display: 'flex',
    padding: theme.spacing(0.5, 0.5, 0, 0.5),
  },
}));

export default useStyles;
