import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'grid',
    gridTemplateAreas: '"sidebar header" "sidebar content"',
    gridTemplateColumns: '20.5em auto',
    gridTemplateRows: '6.5em auto',
    height: '100vh',
    overflow: 'hidden',
    position: 'fixed',
    width: '100%',

    '& ::-webkit-scrollbar': {
      width: '0.4rem',
    },
    '& ::-webkit-scrollbar-track': {
      webkitBoxShadow: `inset 0 0 8px ${theme.palette.common.black}`,
      marginTop: theme.spacing(1),
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
    overflowY: 'scroll',
    padding: theme.spacing(5, 7.5),
  },
  sidebar: {
    gridArea: 'sidebar',
  },
}));

export default useStyles;
