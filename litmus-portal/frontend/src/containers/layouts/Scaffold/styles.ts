import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'fixed',
    overflow: 'hidden',
    height: '100vh',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '15em auto',
    gridTemplateRows: '5em auto',
    gap: '1px 1px',
    gridTemplateAreas: '"sidebar header" "sidebar content"',
  },
  header: {
    gridArea: 'header',
  },
  content: {
    gridArea: 'content',
    background: theme.palette.layoutBackground,
    padding: theme.spacing(3),
    overflowY: 'scroll',
  },
  sidebar: {
    gridArea: 'sidebar',
  },
}));

export default useStyles;
