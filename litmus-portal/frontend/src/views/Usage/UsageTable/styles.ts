/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  // Header Section Properties
  headerSection: {
    marginBottom: theme.spacing(2),
    width: '100%',
    height: '5.625rem',
    display: 'flex',
    backgroundColor: theme.palette.cards.background,
  },

  search: {
    margin: theme.spacing(2),
  },

  table: {
    minWidth: 650,
  },
}));
export default useStyles;
