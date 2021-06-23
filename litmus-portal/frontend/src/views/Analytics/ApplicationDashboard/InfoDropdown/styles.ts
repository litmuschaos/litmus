import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3.5),
  },
  header: {
    background: theme.palette.cards.header,
    height: '3.25rem',
    paddingTop: theme.spacing(0.5),
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: '1rem',
    lineHeight: '140%',
    padding: theme.spacing(1.5, 0, 0, 3),
  },
  body: {
    display: 'flex',
    justifyContent: 'space-evenly',
    background: theme.palette.background.paper,
    padding: theme.spacing(0, 1),
  },
  infoSectionElement: {
    width: '33.33%',
    padding: theme.spacing(2, 2, 3, 2),
  },
  sectionHeader: {
    lineHeight: '150%',
    fontSize: '1rem',
    fontWeight: 500,
    padding: theme.spacing(1, 0, 3),
    letterSpacing: '0.1714px',
  },
  dashboardMetaDataItem: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    marginBottom: theme.spacing(0.75),
  },
  infoKey: {
    fontSize: '0.825rem',
    lineHeight: '0.9375rem',
    color: theme.palette.highlight,
  },
  infoValue: {
    fontSize: '0.825rem',
    lineHeight: '150%',
  },
  checkBoxesContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    maxHeight: '7rem',
    overflowY: 'scroll',
    paddingLeft: theme.spacing(1),
  },
  formControlLabel: {
    fontSize: '0.75rem',
    letterSpacing: '0.02em',
    lineHeight: '150%',
  },
  inlineIcon: {
    margin: theme.spacing(0.5, 1, 0, 0),
    width: '1rem',
    height: '1rem',
  },
  linkIcon: {
    margin: theme.spacing(0, 0, 0.45, 0.75),
    width: '1rem',
    height: '1rem',
  },
  iconWithTextDiv: {
    display: 'flex',
  },
}));

export default useStyles;
