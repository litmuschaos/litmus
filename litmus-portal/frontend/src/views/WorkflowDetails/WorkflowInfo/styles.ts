import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  // Class to be used when WorkflowInfo is in Bottom of DagreGraph.
  rootLight: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(5),
  },

  // Classto be used when WorkflowInfo is in Header of Nodes Table.
  rootHeader: {
    backgroundColor: theme.palette.cards.header,
    padding: theme.spacing(5),
  },

  // Header
  header: {
    fontSize: '1.5rem',
    marginBottom: theme.spacing(2),
  },

  // Section divided into 4 parts in flex display.
  section: {
    display: 'flex',
  },

  // Division in 4 parts
  subSection: {
    width: '25%',
  },

  // Sub section division in 2 parts
  subCategorySection: {
    width: '50%',
  },

  // Sub Section Title
  subSectionTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
  },

  // Sub category Section Title
  subCategorySectionTitle: {
    color: theme.palette.text.disabled,
    fontSize: '1rem',
  },

  resilliencyScore: {
    color: theme.palette.highlight,
    fontSize: '1.5rem',
  },
}));

export default useStyles;
