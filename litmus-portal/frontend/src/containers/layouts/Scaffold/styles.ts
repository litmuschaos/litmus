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

    // Scrollbar
    '& ::-webkit-scrollbar': {
      width: '0.4rem',
    },
    '& ::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 8px ${theme.palette.common.black}`,
    },
    '& ::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.light,
      borderRadius: 8,
    },
    '& img': {
      userDrag: 'none',
    },
  },
  header: {
    gridArea: 'header',
  },
  content: {
    gridArea: 'content',
    background: theme.palette.background.default,
    padding: theme.spacing(3),
    overflowY: 'scroll',
  },
  sidebar: {
    gridArea: 'sidebar',
  },
}));

export default useStyles;
