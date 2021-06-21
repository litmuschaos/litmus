/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Header Section Properties
  headerSection: {
    marginBottom: theme.spacing(2),
    width: '100%',
    height: '5rem',
    display: 'flex',
    backgroundColor: theme.palette.cards.background,
  },

  search: {
    margin: theme.spacing(3, 2),
  },

  noProjects: {
    padding: theme.spacing(3),
  },

  center: {
    margin: 'auto',
    textAlign: 'center',
  },

  table: {
    marginBottom: theme.spacing(5),
  },

  root: {
    backgroundColor: theme.palette.background.paper,
  },

  tableMain: {
    marginTop: theme.spacing(4.25),
    backgroundColor: theme.palette.cards.background,
    height: '28rem',
    '&::-webkit-scrollbar': {
      width: '0.2em',
    },
    '&::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 6px ${theme.palette.common.black}`,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.main,
    },
  },

  tableHead: {
    height: '4.6875rem',
    '& p': {
      display: 'block',
    },
    '& th': {
      backgroundColor: theme.palette.cards.background,
      color: theme.palette.text.hint,
    },
  },

  projectData: {
    height: '4.6875rem',
  },

  projectName: {
    paddingLeft: theme.spacing(5),
  },

  tableDataProjectName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    paddingLeft: theme.spacing(5),
  },
}));
export default useStyles;
